#!/usr/bin/env python3
"""
Backend API Testing Script for Hugging Face Space
Tests all endpoints: Chat, TTS, STT, Image Classification, Health Checks

Usage:
    python test_backend.py
    python test_backend.py --endpoint chat
    python test_backend.py --verbose
"""

import requests
import json
import time
import sys
import argparse
from typing import Dict, Any, Optional
from datetime import datetime

# Base URL for the Hugging Face Space
# Space: Sean22123/backend -> https://sean22123-backend.hf.space
BASE_URL = "https://sean22123-backend.hf.space"

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(60)}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.RESET}\n")

def print_success(text: str):
    """Print success message"""
    print(f"{Colors.GREEN}✓ {text}{Colors.RESET}")

def print_error(text: str):
    """Print error message"""
    print(f"{Colors.RED}✗ {text}{Colors.RESET}")

def print_info(text: str):
    """Print info message"""
    print(f"{Colors.BLUE}ℹ {text}{Colors.RESET}")

def print_warning(text: str):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.RESET}")

class BackendTester:
    def __init__(self, base_url: str = BASE_URL, verbose: bool = False):
        self.base_url = base_url
        self.verbose = verbose
        self.results = {
            'passed': 0,
            'failed': 0,
            'total': 0
        }
    
    def log(self, message: str):
        """Log verbose messages"""
        if self.verbose:
            print(f"{Colors.YELLOW}[DEBUG] {message}{Colors.RESET}")
    
    def test_endpoint(self, name: str, method: str, endpoint: str, 
                     data: Optional[Dict] = None, 
                     headers: Optional[Dict] = None,
                     files: Optional[Dict] = None) -> Dict[str, Any]:
        """Test a single endpoint"""
        self.results['total'] += 1
        url = f"{self.base_url}{endpoint}"
        
        print(f"\n{Colors.BOLD}Testing: {name}{Colors.RESET}")
        print(f"URL: {url}")
        print(f"Method: {method}")
        
        try:
            start_time = time.time()
            
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=headers, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            elapsed_time = time.time() - start_time
            
            self.log(f"Response Status: {response.status_code}")
            self.log(f"Response Time: {elapsed_time:.2f}s")
            
            if response.status_code == 200:
                print_success(f"Status: {response.status_code} OK")
                print_info(f"Response Time: {elapsed_time:.2f}s")
                
                try:
                    response_data = response.json()
                    if self.verbose:
                        print(f"Response Data: {json.dumps(response_data, indent=2)}")
                    else:
                        # Print truncated response
                        response_str = json.dumps(response_data)
                        if len(response_str) > 200:
                            print(f"Response: {response_str[:200]}...")
                        else:
                            print(f"Response: {response_str}")
                    self.results['passed'] += 1
                    return {'success': True, 'data': response_data, 'time': elapsed_time}
                except json.JSONDecodeError:
                    # Non-JSON response (e.g., audio file)
                    print_info(f"Response Type: {response.headers.get('Content-Type', 'unknown')}")
                    print_info(f"Response Size: {len(response.content)} bytes")
                    self.results['passed'] += 1
                    return {'success': True, 'data': response.content, 'time': elapsed_time}
            else:
                print_error(f"Status: {response.status_code}")
                print_error(f"Response: {response.text[:500]}")
                self.results['failed'] += 1
                return {'success': False, 'error': response.text, 'time': elapsed_time}
                
        except requests.exceptions.Timeout:
            print_error("Request timed out (30s)")
            self.results['failed'] += 1
            return {'success': False, 'error': 'Timeout'}
        except requests.exceptions.ConnectionError:
            print_error("Connection error - Backend may be down")
            self.results['failed'] += 1
            return {'success': False, 'error': 'Connection Error'}
        except Exception as e:
            print_error(f"Error: {str(e)}")
            self.results['failed'] += 1
            return {'success': False, 'error': str(e)}
    
    def test_health_checks(self):
        """Test health check endpoints"""
        print_header("HEALTH CHECK TESTS")
        
        # TTS Health
        self.test_endpoint(
            name="TTS Health Check",
            method="GET",
            endpoint="/tts/health"
        )
        
        # STT Health
        self.test_endpoint(
            name="STT Health Check",
            method="GET",
            endpoint="/stt/health"
        )
    
    def test_tts_endpoints(self):
        """Test Text-to-Speech endpoints"""
        print_header("TEXT-TO-SPEECH TESTS")
        
        # Get available voices
        voices_result = self.test_endpoint(
            name="Get TTS Voices",
            method="GET",
            endpoint="/tts/voices"
        )
        
        # Test TTS speak
        self.test_endpoint(
            name="TTS Speak",
            method="POST",
            endpoint="/tts/speak",
            data={
                "text": "Hello, this is a test of the text to speech system.",
                "voice": "en-US-AndrewNeural",
                "rate": 1.0,
                "pitch": 1.0
            }
        )
    
    def test_chat_endpoint(self):
        """Test Chat endpoint"""
        print_header("CHAT API TESTS")
        
        # Test basic chat (default model)
        self.test_endpoint(
            name="Chat - Basic Query (Default Model)",
            method="POST",
            endpoint="/chat",
            data={
                "message": "Hello! Can you tell me what you are?",
                "history": []
            }
        )
        
        # Test chat with history
        self.test_endpoint(
            name="Chat - With History",
            method="POST",
            endpoint="/chat",
            data={
                "message": "What did I just ask you?",
                "history": [
                    {"role": "user", "content": "Hello! Can you tell me what you are?"},
                    {"role": "assistant", "content": "I am an AI assistant."}
                ]
            }
        )
        
        # Test chat with different query types
        test_queries = [
            "What is 2 + 2?",
            "Explain quantum computing in simple terms.",
            "Write a haiku about coding."
        ]
        
        for query in test_queries:
            self.test_endpoint(
                name=f"Chat - Query: '{query[:30]}...'",
                method="POST",
                endpoint="/chat",
                data={
                    "message": query,
                    "history": []
                }
            )
    
    def test_qwen_model(self):
        """Test Qwen model specifically"""
        print_header("QWEN MODEL TESTS")
        
        # Test Qwen model - basic query
        self.test_endpoint(
            name="Qwen - Basic Query",
            method="POST",
            endpoint="/chat",
            data={
                "message": "Hello! Introduce yourself.",
                "history": [],
                "model": "qwen"
            }
        )
        
        # Test Qwen model - math problem
        self.test_endpoint(
            name="Qwen - Math Problem",
            method="POST",
            endpoint="/chat",
            data={
                "message": "Calculate 15 * 23 + 47",
                "history": [],
                "model": "qwen"
            }
        )
        
        # Test Qwen model - reasoning task
        self.test_endpoint(
            name="Qwen - Reasoning Task",
            method="POST",
            endpoint="/chat",
            data={
                "message": "If a train travels at 60 mph for 2.5 hours, how far does it go?",
                "history": [],
                "model": "qwen"
            }
        )
        
        # Test Qwen model - creative writing
        self.test_endpoint(
            name="Qwen - Creative Writing",
            method="POST",
            endpoint="/chat",
            data={
                "message": "Write a short poem about artificial intelligence.",
                "history": [],
                "model": "qwen"
            }
        )
        
        # Test Qwen model - with conversation history
        self.test_endpoint(
            name="Qwen - With History",
            method="POST",
            endpoint="/chat",
            data={
                "message": "What was my previous question?",
                "history": [
                    {"role": "user", "content": "What is the capital of France?"},
                    {"role": "assistant", "content": "The capital of France is Paris."}
                ],
                "model": "qwen"
            }
        )
    
    def test_image_classification(self):
        """Test Image Classification endpoint"""
        print_header("IMAGE CLASSIFICATION TESTS")
        
        # Test with a sample base64 image (1x1 red pixel)
        sample_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
        
        self.test_endpoint(
            name="Image Classification - Sample Image (Default Model)",
            method="POST",
            endpoint="/classify-image",
            data={
                "image": sample_image_base64
            }
        )
    
    def test_vit_model(self):
        """Test Google ViT model for image classification"""
        print_header("GOOGLE VIT MODEL TESTS")
        
        # Test with 1x1 red pixel
        red_pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
        
        self.test_endpoint(
            name="ViT - Red Pixel Classification",
            method="POST",
            endpoint="/classify-image",
            data={
                "image": red_pixel,
                "model": "vit"
            }
        )
        
        # Test with 1x1 blue pixel
        blue_pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIApD5fRAAAAABJRU5ErkJggg=="
        
        self.test_endpoint(
            name="ViT - Blue Pixel Classification",
            method="POST",
            endpoint="/classify-image",
            data={
                "image": blue_pixel,
                "model": "vit"
            }
        )
        
        # Test with 1x1 green pixel
        green_pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/4HwAEhgIBqCBeVQAAAABJRU5ErkJggg=="
        
        self.test_endpoint(
            name="ViT - Green Pixel Classification",
            method="POST",
            endpoint="/classify-image",
            data={
                "image": green_pixel,
                "model": "vit"
            }
        )
        
        # Test with invalid base64
        self.test_endpoint(
            name="ViT - Invalid Image Data",
            method="POST",
            endpoint="/classify-image",
            data={
                "image": "invalid_base64_data",
                "model": "vit"
            }
        )
    
    def test_stt_endpoint(self):
        """Test Speech-to-Text endpoint"""
        print_header("SPEECH-TO-TEXT TESTS")
        
        print_warning("STT test requires actual audio file - skipping for now")
        print_info("To test STT manually, send a POST request with audio/webm content")
        print_info(f"Endpoint: {self.base_url}/stt/transcribe-blob")
    
    def test_all(self):
        """Run all tests"""
        print_header(f"BACKEND API TESTING - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print_info(f"Base URL: {self.base_url}")
        
        # Run all test suites
        self.test_health_checks()
        self.test_tts_endpoints()
        self.test_chat_endpoint()
        self.test_qwen_model()
        self.test_image_classification()
        self.test_vit_model()
        self.test_stt_endpoint()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print_header("TEST SUMMARY")
        
        total = self.results['total']
        passed = self.results['passed']
        failed = self.results['failed']
        
        print(f"Total Tests: {total}")
        print_success(f"Passed: {passed}")
        
        if failed > 0:
            print_error(f"Failed: {failed}")
        else:
            print_success(f"Failed: {failed}")
        
        if total > 0:
            success_rate = (passed / total) * 100
            print(f"\nSuccess Rate: {success_rate:.1f}%")
            
            if success_rate == 100:
                print_success("\n All tests passed!")
            elif success_rate >= 80:
                print_warning("\n  Most tests passed, but some failed.")
            else:
                print_error("\n Many tests failed. Check backend status.")

def main():
    parser = argparse.ArgumentParser(
        description='Test Hugging Face Space Backend API',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python test_backend.py                    # Run all tests
  python test_backend.py --verbose          # Run with verbose output
  python test_backend.py --endpoint chat    # Test only chat endpoint
  python test_backend.py --endpoint health  # Test only health checks
        """
    )
    
    parser.add_argument(
        '--endpoint',
        choices=['all', 'health', 'tts', 'chat', 'qwen', 'image', 'vit', 'stt'],
        default='all',
        help='Specific endpoint to test (default: all)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Enable verbose output'
    )
    
    parser.add_argument(
        '--url',
        default=BASE_URL,
        help=f'Backend URL (default: {BASE_URL})'
    )
    
    args = parser.parse_args()
    
    tester = BackendTester(base_url=args.url, verbose=args.verbose)
    
    # Run specific test or all tests
    if args.endpoint == 'all':
        tester.test_all()
    elif args.endpoint == 'health':
        tester.test_health_checks()
        tester.print_summary()
    elif args.endpoint == 'tts':
        tester.test_tts_endpoints()
        tester.print_summary()
    elif args.endpoint == 'chat':
        tester.test_chat_endpoint()
        tester.print_summary()
    elif args.endpoint == 'qwen':
        tester.test_qwen_model()
        tester.print_summary()
    elif args.endpoint == 'image':
        tester.test_image_classification()
        tester.print_summary()
    elif args.endpoint == 'vit':
        tester.test_vit_model()
        tester.print_summary()
    elif args.endpoint == 'stt':
        tester.test_stt_endpoint()
        tester.print_summary()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Test interrupted by user{Colors.RESET}")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error: {str(e)}")
        sys.exit(1)