import logging
import time

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

def run_review_loop():
    """
    Mock for T+1 Hour review loop.
    Queries Supabase for appointments completed in the last hour without a review.
    """
    logging.info("[CRON] Running T+1 Hour Review Loop...")
    # Simulate querying DB
    time.sleep(1)
    logging.info("[CRON] Found 1 completed appointment. Dispatching WhatsApp Review template.")
    logging.info("[WhatsApp] 'How was your cut today? Tap here to leave a 5-star review on Google.'")

def run_retention_loop():
    """
    Mock for T+21 Days retention loop.
    Queries Supabase for appointments 21 days ago where the customer hasn't booked since.
    """
    logging.info("[CRON] Running T+21 Days Retention Nudge Loop...")
    # Simulate querying DB
    time.sleep(1)
    logging.info("[CRON] Found 2 customers requiring retention nudges. Dispatching templates.")
    logging.info("[WhatsApp] 'It's been 3 weeks since your last fade. Want to grab your usual spot this Friday?'")

if __name__ == '__main__':
    logging.info("Starting Antigravity CRM Cron Simulator...")
    run_review_loop()
    print("-" * 40)
    run_retention_loop()
    logging.info("Cron run complete.")
