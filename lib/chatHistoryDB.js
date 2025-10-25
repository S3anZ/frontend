import { supabase } from './supabase';

// Enhanced Chat History Manager with Supabase integration
export class ChatHistoryDB {
  static STORAGE_KEY = 'chat_history';
  static CURRENT_CHAT_KEY = 'current_chat';

  // Generate unique chat ID in UUID format for Supabase compatibility
  static generateChatId() {
    // Generate a proper UUID v4 format
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Get all chat history for a user from Supabase
  static async getChatHistory(userId) {
    try {
      if (!userId) {
        console.error('No user ID provided');
        return [];
      }

      const { data: chats, error: chatsError } = await supabase
        .from('chats')
        .select(`
          id,
          title,
          is_closed,
          is_active,
          has_image,
          image_url,
          image_name,
          created_at,
          updated_at,
          messages (
            id,
            role,
            content,
            timestamp,
            created_at
          ),
          chat_images (
            id,
            image_url,
            image_name,
            file_size,
            mime_type,
            upload_order,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (chatsError) {
        console.error('Error fetching chats:', chatsError);
        return this.getFallbackHistory(userId);
      }

      // Transform data to match existing format
      const transformedChats = chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        messages: chat.messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          role: msg.role,
          timestamp: msg.timestamp || new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
        isActive: chat.is_active,
        isClosed: chat.is_closed,
        hasImage: chat.has_image,
        imageUrl: chat.image_url,
        imageName: chat.image_name,
        images: chat.chat_images.map(image => ({
          id: image.id,
          url: image.image_url,
          name: image.image_name,
          fileSize: image.file_size,
          mimeType: image.mime_type,
          uploadOrder: image.upload_order,
          createdAt: image.created_at
        }))
      }));

      return transformedChats;
    } catch (error) {
      console.error('Error loading chat history from database:', error);
      return this.getFallbackHistory(userId);
    }
  }

  // Fallback to localStorage if database fails
  static getFallbackHistory(userId) {
    try {
      const history = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading fallback chat history:', error);
      return [];
    }
  }

  // Save chat history to both Supabase and localStorage
  static async saveChatHistory(userId, history) {
    try {
      // Save to localStorage as fallback
      localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Create a new chat session (only in memory initially)
  static async createNewChat(userId, title = null) {
    try {
      if (!userId) {
        throw new Error('No user ID provided');
      }

      // Create a temporary chat ID for the session
      const tempChatId = this.generateChatId();
      const chatTitle = title || `Chat ${new Date().toLocaleDateString()}`;
      
      const newChat = {
        id: tempChatId,
        title: chatTitle,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        isClosed: false,
        isTemporary: true // Flag to indicate this hasn't been saved to DB yet
      };

      await this.setCurrentChat(userId, tempChatId);
      return newChat;
    } catch (error) {
      console.error('Error creating new chat:', error);
      return this.createFallbackChat(userId, title);
    }
  }

  // Save chat to database when first message is added
  static async saveChatToDatabase(userId, chat) {
    try {
      const { data: savedChat, error } = await supabase
        .from('chats')
        .insert([
          {
            user_id: userId,
            title: chat.title,
            is_closed: false,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error saving chat to database:', error);
        return null;
      }

      return {
        id: savedChat.id,
        title: savedChat.title,
        messages: chat.messages,
        createdAt: savedChat.created_at,
        updatedAt: savedChat.updated_at,
        isActive: savedChat.is_active,
        isClosed: savedChat.is_closed,
        isTemporary: false
      };
    } catch (error) {
      console.error('Error saving chat to database:', error);
      return null;
    }
  }

  // Fallback chat creation
  static createFallbackChat(userId, title = null) {
    const chatId = this.generateChatId();
    const newChat = {
      id: chatId,
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      isClosed: false
    };

    const history = this.getFallbackHistory(userId);
    history.unshift(newChat);
    this.saveChatHistory(userId, history);
    this.setCurrentChat(userId, chatId);
    
    return newChat;
  }

  // Update an existing chat in Supabase
  static async updateChat(userId, chatId, updates) {
    try {
      const { data: chat, error } = await supabase
        .from('chats')
        .update({
          title: updates.title,
          is_closed: updates.isClosed,
          is_active: updates.isActive
        })
        .eq('id', chatId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating chat:', error);
        return null;
      }

      return {
        id: chat.id,
        title: chat.title,
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
        isActive: chat.is_active,
        isClosed: chat.is_closed
      };
    } catch (error) {
      console.error('Error updating chat:', error);
      return null;
    }
  }

  // Add message to a chat in Supabase
  static async addMessageToChat(userId, chatId, message, currentChat = null) {
    try {
      let actualChatId = chatId;
      let updatedChat = currentChat;

      // If this is a temporary chat (first message), save it to database first
      if (currentChat && currentChat.isTemporary) {
        updatedChat = await this.saveChatToDatabase(userId, currentChat);
        if (updatedChat) {
          actualChatId = updatedChat.id;
          // Update the current chat ID to the new database ID
          await this.setCurrentChat(userId, actualChatId);
        } else {
          // Fallback: keep using temporary ID
          console.warn('Failed to save chat to database, using temporary storage');
          return message;
        }
      }

      // Insert the message to database
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: actualChatId,
            role: message.role,
            content: message.text,
            timestamp: message.timestamp
          }
        ])
        .select()
        .single();

      if (messageError) {
        console.error('Error adding message:', messageError);
        return message; // Return original message as fallback
      }

      // Update chat title if it's the first user message
      if (message.role === 'user') {
        const { data: messages } = await supabase
          .from('messages')
          .select('id')
          .eq('chat_id', actualChatId)
          .eq('role', 'user');

        if (messages && messages.length === 1) {
          const title = message.text.length > 50 
            ? message.text.substring(0, 50) + '...' 
            : message.text;
          
          await this.updateChat(userId, actualChatId, { title });
        }
      }

      // Update the chat's updated_at timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', actualChatId)
        .eq('user_id', userId);

      return { ...messageData, chatId: actualChatId };
    } catch (error) {
      console.error('Error adding message to chat:', error);
      return message; // Return original message as fallback
    }
  }

  // Close a chat (seal it)
  static async closeChat(userId, chatId) {
    return await this.updateChat(userId, chatId, { 
      isClosed: true, 
      isActive: false 
    });
  }

  // Get a specific chat with messages
  static async getChat(userId, chatId) {
    try {
      const { data: chat, error } = await supabase
        .from('chats')
        .select(`
          id,
          title,
          is_closed,
          is_active,
          has_image,
          image_url,
          image_name,
          created_at,
          updated_at,
          messages (
            id,
            role,
            content,
            timestamp,
            created_at
          ),
          chat_images (
            id,
            image_url,
            image_name,
            file_size,
            mime_type,
            upload_order,
            created_at
          )
        `)
        .eq('id', chatId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching chat:', error);
        return null;
      }

      return {
        id: chat.id,
        title: chat.title,
        messages: chat.messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          role: msg.role,
          timestamp: msg.timestamp || new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
        isActive: chat.is_active,
        isClosed: chat.is_closed,
        hasImage: chat.has_image,
        imageUrl: chat.image_url,
        imageName: chat.image_name,
        images: chat.chat_images.map(image => ({
          id: image.id,
          url: image.image_url,
          name: image.image_name,
          fileSize: image.file_size,
          mimeType: image.mime_type,
          uploadOrder: image.upload_order,
          createdAt: image.created_at
        }))
      };
    } catch (error) {
      console.error('Error getting chat:', error);
      return null;
    }
  }

  // Set current active chat
  static async setCurrentChat(userId, chatId) {
    try {
      localStorage.setItem(`${this.CURRENT_CHAT_KEY}_${userId}`, chatId);
    } catch (error) {
      console.error('Error setting current chat:', error);
    }
  }

  // Get current active chat ID
  static getCurrentChatId(userId) {
    try {
      return localStorage.getItem(`${this.CURRENT_CHAT_KEY}_${userId}`);
    } catch (error) {
      console.error('Error getting current chat:', error);
      return null;
    }
  }

  // Delete a chat from Supabase
  static async deleteChat(userId, chatId) {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting chat:', error);
        return false;
      }

      // Clear current chat if it was deleted
      if (this.getCurrentChatId(userId) === chatId) {
        localStorage.removeItem(`${this.CURRENT_CHAT_KEY}_${userId}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  }

  // Clear all chat history for a user
  static async clearAllHistory(userId) {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing all history:', error);
      }

      localStorage.removeItem(`${this.STORAGE_KEY}_${userId}`);
      localStorage.removeItem(`${this.CURRENT_CHAT_KEY}_${userId}`);
    } catch (error) {
      console.error('Error clearing all history:', error);
    }
  }

  // Migrate existing localStorage data to Supabase
  static async migrateToDatabase(userId) {
    try {
      const localHistory = this.getFallbackHistory(userId);
      
      if (localHistory.length === 0) {
        return { success: true, migrated: 0 };
      }

      let migratedCount = 0;

      for (const chat of localHistory) {
        try {
          // Create chat in database
          const { data: newChat, error: chatError } = await supabase
            .from('chats')
            .insert([
              {
                user_id: userId,
                title: chat.title,
                is_closed: chat.isClosed || false,
                is_active: chat.isActive !== false,
                created_at: chat.createdAt || new Date().toISOString(),
                updated_at: chat.updatedAt || new Date().toISOString()
              }
            ])
            .select()
            .single();

          if (chatError) {
            console.error('Error migrating chat:', chatError);
            continue;
          }

          // Migrate messages
          if (chat.messages && chat.messages.length > 0) {
            const messagesToInsert = chat.messages.map(msg => ({
              chat_id: newChat.id,
              role: msg.role,
              content: msg.text,
              timestamp: msg.timestamp,
              created_at: new Date().toISOString()
            }));

            const { error: messagesError } = await supabase
              .from('messages')
              .insert(messagesToInsert);

            if (messagesError) {
              console.error('Error migrating messages:', messagesError);
            }
          }

          // Migrate images
          if (chat.images && chat.images.length > 0) {
            const imagesToInsert = chat.images.map(image => ({
              chat_id: newChat.id,
              image_url: image.url,
              image_name: image.name,
              file_size: image.fileSize,
              mime_type: image.mimeType,
              upload_order: image.uploadOrder,
              created_at: new Date().toISOString()
            }));

            const { error: imagesError } = await supabase
              .from('chat_images')
              .insert(imagesToInsert);

            if (imagesError) {
              console.error('Error migrating images:', imagesError);
            }
          }

          migratedCount++;
        } catch (error) {
          console.error('Error migrating individual chat:', error);
        }
      }

      return { success: true, migrated: migratedCount };
    } catch (error) {
      console.error('Error during migration:', error);
      return { success: false, error: error.message };
    }
  }

  // Upload an image to a chat
  static async uploadImageToChat(userId, chatId, image) {
    try {
      const { data: uploadedImage, error } = await supabase
        .from('chat_images')
        .insert([
          {
            chat_id: chatId,
            image_url: image.url,
            image_name: image.name,
            file_size: image.fileSize,
            mime_type: image.mimeType,
            upload_order: image.uploadOrder,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      return {
        id: uploadedImage.id,
        url: uploadedImage.image_url,
        name: uploadedImage.image_name,
        fileSize: uploadedImage.file_size,
        mimeType: uploadedImage.mime_type,
        uploadOrder: uploadedImage.upload_order,
        createdAt: uploadedImage.created_at
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }

  // Get all images for a chat
  static async getImagesForChat(userId, chatId) {
    try {
      const { data: images, error } = await supabase
        .from('chat_images')
        .select(`
          id,
          image_url,
          image_name,
          file_size,
          mime_type,
          upload_order,
          created_at
        `)
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching images:', error);
        return [];
      }

      return images.map(image => ({
        id: image.id,
        url: image.image_url,
        name: image.image_name,
        fileSize: image.file_size,
        mimeType: image.mime_type,
        uploadOrder: image.upload_order,
        createdAt: image.created_at
      }));
    } catch (error) {
      console.error('Error getting images:', error);
      return [];
    }
  }

  // Delete an image from a chat
  static async deleteImageFromChat(userId, chatId, imageId) {
    try {
      const { error } = await supabase
        .from('chat_images')
        .delete()
        .eq('id', imageId)
        .eq('chat_id', chatId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting image:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
}
