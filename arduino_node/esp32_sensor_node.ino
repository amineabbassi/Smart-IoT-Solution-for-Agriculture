// ESP32 Sensor Node Code
#include <SPI.h>
#include <LoRa.h>
#include <DHT.h>
#include <ArduinoJson.h>

// Pin Definitions
#define DHTPIN 4
#define DHTTYPE DHT22
#define SPRINKLER_PIN 5
#define LORA_SS_PIN 18
#define LORA_RST_PIN 14
#define LORA_DIO0_PIN 26

DHT dht(DHTPIN, DHTTYPE);

// Configuration
const float TEMP_THRESHOLD = 30.0; // Celsius
const long SEND_INTERVAL = 30000;  // 30 seconds
bool sprinklerState = false;
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  pinMode(SPRINKLER_PIN, OUTPUT);
  digitalWrite(SPRINKLER_PIN, LOW);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Initialize LoRa
  LoRa.setPins(LORA_SS_PIN, LORA_RST_PIN, LORA_DIO0_PIN);
  if (!LoRa.begin(915E6)) {
    Serial.println("LoRa initialization failed!");
    while (1);
  }
  
  Serial.println("LoRa Node Initialized!");
}

void loop() {
  if (millis() - lastSendTime > SEND_INTERVAL) {
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    
    // Check if readings are valid
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }
    
    // Auto control sprinkler based on temperature
    if (temperature > TEMP_THRESHOLD && !sprinklerState) {
      digitalWrite(SPRINKLER_PIN, HIGH);
      sprinklerState = true;
    } else if (temperature <= TEMP_THRESHOLD && sprinklerState) {
      digitalWrite(SPRINKLER_PIN, LOW);
      sprinklerState = false;
    }
    
    // Prepare JSON data
    StaticJsonDocument<200> doc;
    doc["nodeId"] = "node1";
    doc["temp"] = temperature;
    doc["humidity"] = humidity;
    doc["sprinkler"] = sprinklerState;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    // Send data via LoRa
    LoRa.beginPacket();
    LoRa.print(jsonString);
    LoRa.endPacket();
    
    Serial.println("Sent data: " + jsonString);
    lastSendTime = millis();
  }
  
  // Check for incoming commands
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String command = "";
    while (LoRa.available()) {
      command += (char)LoRa.read();
    }
    
    // Handle sprinkler control command
    if (command == "SPRINKLER_ON") {
      digitalWrite(SPRINKLER_PIN, HIGH);
      sprinklerState = true;
    } else if (command == "SPRINKLER_OFF") {
      digitalWrite(SPRINKLER_PIN, LOW);
      sprinklerState = false;
    }
  }
}