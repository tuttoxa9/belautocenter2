from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 1080})

        # Navigate to a specific car directly
        page.goto('http://localhost:3000/catalog/1', wait_until='domcontentloaded')

        # Click "В лизинг" button, wait for the state
        leasing_btn = page.locator('button:has-text("В лизинг")').first
        try:
            leasing_btn.wait_for(timeout=10000)
            leasing_btn.click()
            page.wait_for_timeout(2000) # wait for animation

            page.screenshot(path='/home/jules/verification/car_details_modal.png')
            print("Screenshot taken: /home/jules/verification/car_details_modal.png")
        except Exception as e:
            print("Failed:", e)
            page.screenshot(path='/home/jules/verification/car_details_page_err.png')

        browser.close()

if __name__ == '__main__':
    run()
