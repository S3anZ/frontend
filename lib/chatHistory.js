// Chat History Management Utility
export class ChatHistoryManager {
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

  // Get all chat history for a user
  static getChatHistory(userId) {
    try {
      const history = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  // Save chat history for a user
  static saveChatHistory(userId, history) {
    try {
      localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  // Create a new chat session
  static createNewChat(userId, title = null) {
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

    const history = this.getChatHistory(userId);
    history.unshift(newChat); // Add to beginning
    this.saveChatHistory(userId, history);
    this.setCurrentChat(userId, chatId);
    
    return newChat;
  }

  // Update an existing chat
  static updateChat(userId, chatId, updates) {
    const history = this.getChatHistory(userId);
    const chatIndex = history.findIndex(chat => chat.id === chatId);
    
    if (chatIndex !== -1) {
      history[chatIndex] = {
        ...history[chatIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveChatHistory(userId, history);
      return history[chatIndex];
    }
    return null;
  }

  // Add message to a chat
  static addMessageToChat(userId, chatId, message) {
    const history = this.getChatHistory(userId);
    const chatIndex = history.findIndex(chat => chat.id === chatId);
    
    if (chatIndex !== -1 && !history[chatIndex].isClosed) {
      history[chatIndex].messages.push(message);
      history[chatIndex].updatedAt = new Date().toISOString();
      
      // Update title based on first user message if it's still default
      if (history[chatIndex].messages.length === 1 && message.role === 'user') {
        const title = message.text.length > 50 
          ? message.text.substring(0, 50) + '...' 
          : message.text;
        history[chatIndex].title = title;
      }
      
      this.saveChatHistory(userId, history);
      return history[chatIndex];
    }
    return null;
  }

  // Close a chat (seal it)
  static closeChat(userId, chatId) {
    return this.updateChat(userId, chatId, { 
      isClosed: true, 
      isActive: false 
    });
  }

  // Get a specific chat
  static getChat(userId, chatId) {
    const history = this.getChatHistory(userId);
    return history.find(chat => chat.id === chatId) || null;
  }

  // Set current active chat
  static setCurrentChat(userId, chatId) {
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

  // Delete a chat
  static deleteChat(userId, chatId) {
    const history = this.getChatHistory(userId);
    const filteredHistory = history.filter(chat => chat.id !== chatId);
    this.saveChatHistory(userId, filteredHistory);
    
    // Clear current chat if it was deleted
    if (this.getCurrentChatId(userId) === chatId) {
      localStorage.removeItem(`${this.CURRENT_CHAT_KEY}_${userId}`);
    }
  }

  // Clear all chat history for a user
  static clearAllHistory(userId) {
    localStorage.removeItem(`${this.STORAGE_KEY}_${userId}`);
    localStorage.removeItem(`${this.CURRENT_CHAT_KEY}_${userId}`);
  }
}
