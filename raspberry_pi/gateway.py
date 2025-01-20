#!/usr/bin/env python3
import time
import json
import serial
import requests
import RPi.GPIO as GPIO

# ThingSpeak configuration
THINGSPEAK_WRITE_API_KEY = 'E538BEZV88CBRWJ9'  # Replace with your Write API Key
THINGSPEAK_READ_API_KEY = 'BQE7H26UUD75VYNT'    # Replace with your Read API Key
CHANNEL_ID = '2810591'                   # Replace with your Channel ID

# LoRa configuration
LORA_SERIAL_PORT = '/dev/ttyUSB0'
LORA_BAUD_RATE = 115200

class LoRaGateway:
    def __init__(self):
        self.serial_port = serial.Serial(
            port=LORA_SERIAL_PORT,
            baudrate=LORA_BAUD_RATE,
            timeout=1
        )
        
    def process_data(self, data):
        try:
            # Parse JSON data from LoRa node
            sensor_data = json.loads(data)
            
            # Prepare ThingSpeak data
            payload = {
                'api_key': THINGSPEAK_WRITE_API_KEY,
                'field1': sensor_data['temp'],
                'field2': sensor_data['humidity'],
                'field3': 1 if sensor_data['sprinkler'] else 0
            }
            
            # Send to ThingSpeak
            response = requests.post(
                'https://api.thingspeak.com/update',
                params=payload
            )
            
            if response.status_code == 200:
                print(f"Data sent to ThingSpeak: {sensor_data}")
            else:
                print(f"Error sending data: {response.status_code}")
            
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
        except Exception as e:
            print(f"Error processing data: {e}")
    
    def send_command(self, command):
        try:
            self.serial_port.write(command.encode())
            print(f"Sent command: {command}")
        except Exception as e:
            print(f"Error sending command: {e}")
    
    def check_commands(self):
        try:
            # Read latest field for commands (using field4)
            response = requests.get(
                f'https://api.thingspeak.com/channels/{CHANNEL_ID}/fields/4/last',
                params={'api_key': THINGSPEAK_READ_API_KEY}
            )
            
            if response.status_code == 200:
                command_data = response.json()
                if 'field4' in command_data:
                    command = command_data['field4']
                    if command == '1':
                        self.send_command('SPRINKLER_ON')
                    elif command == '0':
                        self.send_command('SPRINKLER_OFF')
            
        except Exception as e:
            print(f"Error checking commands: {e}")
    
    def run(self):
        print("LoRa Gateway Started")
        last_command_check = 0
        
        while True:
            try:
                # Read sensor data
                if self.serial_port.in_waiting:
                    data = self.serial_port.readline().decode('utf-8').strip()
                    if data:
                        self.process_data(data)
                
                # Check commands every 15 seconds
                current_time = time.time()
                if current_time - last_command_check >= 15:
                    self.check_commands()
                    last_command_check = current_time
                
                time.sleep(0.1)
                
            except Exception as e:
                print(f"Error in main loop: {e}")
                time.sleep(1)

if __name__ == "__main__":
    gateway = LoRaGateway()
    gateway.run()