import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "n8n-mock-server"})

@app.route('/webhook/check_availability', methods=['POST'])
def check_availability():
    """
    Mock endpoint for Vapi `check_availability` tool.
    Vapi sends: barber_id/name, date, time
    """
    data = request.json
    logging.info(f"Received check_availability request: {data}")
    
    # We always return true for the mock
    response = {
        "status": "success",
        "available": True,
        "message": f"Yes, we have {data.get('time')} open with {data.get('barber_name', 'your barber')}. Shall I book that for you?"
    }
    
    return jsonify(response)

@app.route('/webhook/confirm_booking', methods=['POST'])
def confirm_booking():
    """
    Mock endpoint for Vapi `confirm_booking` tool.
    Vapi sends: customer_name, customer_phone, start_time, barber_id, service_id
    """
    data = request.json
    logging.info(f"Received confirm_booking request: {data}")
    
    # In a real n8n flow, this would insert to Supabase & hit Google Calendar & WhatsApp API
    # Here we mock a successful creation
    response = {
        "status": "success",
        "booking_id": f"mock-{int(datetime.now().timestamp())}",
        "message": "Booking confirmed successfully. A WhatsApp message has been dispatched."
    }
    
    return jsonify(response)

@app.route('/webhook/lead_recovery', methods=['POST'])
def lead_recovery():
    """
    Mock endpoint for call abandonment.
    """
    data = request.json
    logging.info(f"Received lead_recovery request: {data}")
    
    response = {
        "status": "success",
        "message": "Recovery WhatsApp dispatched."
    }
    
    return jsonify(response)

if __name__ == '__main__':
    logging.info("Starting n8n Mock Webhook Server on port 5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
