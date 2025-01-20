# Smart-IoT-Solution-for-Agriculture

## Overview
The **Smart Agriculture System** integrates IoT technology with a web-based dashboard to optimize agricultural monitoring and control. It includes:

- **LoRa Gateway** for communication between nodes and the cloud.
- **ESP32 Sensor Node** for collecting temperature and humidity data and controlling a sprinkler system.
- **Dashboard** for visualizing sensor data and remotely controlling the sprinkler.

This project leverages **ThingSpeak** for data storage and communication, enabling real-time monitoring and control of agricultural environments.

---

## Features
- **Temperature and Humidity Monitoring**: Periodic readings from a DHT22 sensor.
- **Sprinkler Automation**: Automatically turns the sprinkler on/off based on temperature thresholds.
- **Remote Control**: Users can manually control the sprinkler via the dashboard.
- **Real-time Data Visualization**: Sensor readings and statuses are updated every 15 seconds.

---

## Architecture

### ESP32 Sensor Node:
- Reads temperature and humidity using the **DHT22 sensor**.
- Sends data to the **LoRa Gateway** using **LoRa communication**.
- Receives sprinkler commands from the gateway.

### LoRa Gateway:
- Receives sensor data from the **ESP32 node**.
- Uploads data to **ThingSpeak**.
- Fetches sprinkler commands from ThingSpeak and relays them to the **ESP32 node**.

### Dashboard:
- Fetches data from **ThingSpeak** to display temperature, humidity, and sprinkler status.
- Sends sprinkler control commands to **ThingSpeak**.

---

## Setup Instructions

### Prerequisites

#### Hardware:
- ESP32 microcontroller.
- DHT22 temperature and humidity sensor.
- LoRa module (e.g., SX1278).
- Raspberry Pi (for the gateway).

#### Software:
- Arduino IDE (for ESP32 programming).
- Python 3 (for the gateway).
- Node.js and npm (for the dashboard).

#### Libraries and Dependencies:
- **ESP32 Sensor Node**:
  - Arduino libraries: `LoRa`, `DHT`, `ArduinoJson`.
- **Gateway**:
  - Python packages: `serial`, `requests`, `RPi.GPIO`.
- **Dashboard**:
  - Node.js packages: `react`, `lucide-react`.

---

### Step 1: Set Up ESP32 Sensor Node
1. Connect the **DHT22 sensor** and **LoRa module** to the ESP32 as per their pin definitions.
2. Install required libraries in the Arduino IDE:
   - `LoRa`
   - `DHT`
   - `ArduinoJson`
3. Flash the `esp32_sensor_node.ino` code onto the ESP32.
4. Verify that the ESP32 is reading sensor data and communicating via LoRa.

---

### Step 2: Set Up LoRa Gateway
1. Connect the **LoRa module** to the Raspberry Pi.
2. Install the required Python libraries using `pip`:
   ```bash
   pip install pyserial requests RPi.GPIO
