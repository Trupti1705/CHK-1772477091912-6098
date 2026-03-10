#include "DHT.h"
#include <TinyGPS++.h>
#include <HardwareSerial.h>

#define DHTPIN 18
#define DHTTYPE DHT11

#define MQ135_PIN 33
#define MQ7_PIN   35

#define LED_PIN   4     // GP2Y10 LED control
#define DUST_PIN  34    // GP2Y10 analog output

#define BUZZER_PIN 25
#define RELAY_PIN  26   // Relay control pin

#define RXD2 16
#define TXD2 17

DHT dht(DHTPIN, DHTTYPE);
TinyGPSPlus gps;
HardwareSerial SerialGPS(2);

// Simple AQI (combined)
int calculateAQI(int gas, int co, float dust) {
  int gasIndex  = map(gas,  0, 4095, 0, 200);
  int coIndex   = map(co,   0, 4095, 0, 200);
  int dustIndex = map(dust * 10, 0, 3000, 0, 200);
  return (gasIndex + coIndex + dustIndex) / 3;
}

void setup() {
  Serial.begin(115200);
  SerialGPS.begin(9600, SERIAL_8N1, RXD2, TXD2);

  dht.begin();

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);

  digitalWrite(LED_PIN, HIGH);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(RELAY_PIN, LOW);   // Motor OFF initially

  Serial.println("=== FULL SENSOR + RELAY + GPS MODE ===");
}

void loop() {

  while (SerialGPS.available()) {
    gps.encode(SerialGPS.read());
  }

  // ---------- DUST SENSOR TIMING ----------
  digitalWrite(LED_PIN, LOW);
  delayMicroseconds(280);

  int dustADC = analogRead(DUST_PIN);

  delayMicroseconds(40);
  digitalWrite(LED_PIN, HIGH);
  delayMicroseconds(9680);

  float voltage = dustADC * (3.3 / 4095.0);
  float dustDensity = (voltage - 0.9) * 1000.0 / 5.0;
  if (dustDensity < 0) dustDensity = 0;

  // ---------- OTHER SENSORS ----------
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  int mq135Val = analogRead(MQ135_PIN);
  int mq7Val   = analogRead(MQ7_PIN);

  int aqi = calculateAQI(mq135Val, mq7Val, dustDensity);

  // ---------- RELAY CONTROL ----------
  if (dustADC >= 144) {
    digitalWrite(RELAY_PIN, HIGH);   // Motor ON
  } else {
    digitalWrite(RELAY_PIN, LOW);    // Motor OFF
  }

  // ---------- BUZZER ALERT ----------
  if (aqi > 30) {
    digitalWrite(BUZZER_PIN, HIGH);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }

  // ---------- SERIAL OUTPUT ----------
  Serial.println("\n----- SENSOR READINGS -----");

  Serial.print("Temp: ");
  Serial.print(isnan(temperature) ? 0 : temperature);
  Serial.println(" °C");

  Serial.print("Humidity: ");
  Serial.print(isnan(humidity) ? 0 : humidity);
  Serial.println(" %");

  Serial.print("MQ135: ");
  Serial.println(mq135Val);

  Serial.print("MQ7: ");
  Serial.println(mq7Val);

  Serial.print("Dust ADC: ");
  Serial.print(dustADC);
  Serial.print("  Voltage: ");
  Serial.print(voltage);
  Serial.print(" V  Dust: ");
  Serial.print(dustDensity);
  Serial.println(" ug/m3");

  Serial.print("Calculated AQI: ");
  Serial.println(aqi);

  if (gps.location.isValid()) {
    Serial.print("Latitude: ");
    Serial.println(gps.location.lat(), 6);
    Serial.print("Longitude: ");
    Serial.println(gps.location.lng(), 6);
  } else {
    Serial.println("GPS: Waiting for signal...");
  }

  if (dustADC >= 144) {
    Serial.println("Relay ON | Motor Running");
  } else {
    Serial.println("Relay OFF | Motor Stopped");
  }

  Serial.println("--------------------------");

  delay(1500);
}
