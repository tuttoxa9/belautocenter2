import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Go to catalog page to find a valid car link
        print("Navigating to /catalog...")
        await page.goto("http://localhost:3000/catalog", wait_until='domcontentloaded')

        # Find the first car link
        print("Waiting for car links...")
        # A typical link to a car is /catalog/<id>
        first_car_link = page.locator('a[href^="/catalog/"]').first

        await first_car_link.wait_for(state="visible", timeout=10000)
        car_url = await first_car_link.get_attribute('href')
        print(f"Found car URL: {car_url}")

        # Navigate to the specific car
        full_url = f"http://localhost:3000{car_url}"
        print(f"Navigating to {full_url}...")
        await page.goto(full_url, wait_until='domcontentloaded')

        # Wait for "В лизинг" button to be visible
        print("Waiting for 'В лизинг' button...")
        leasing_btn = page.locator('button:has-text("В лизинг")').first
        await leasing_btn.wait_for(state="visible", timeout=10000)

        # Click the button to open the drawer
        print("Clicking 'В лизинг'...")
        await leasing_btn.click()

        # Wait for the modal/drawer to appear
        print("Waiting for drawer...")
        await page.wait_for_selector('text="Условия лизинга"', timeout=5000)

        # Wait a bit for animation
        await page.wait_for_timeout(1000)

        # Take screenshot
        print("Taking screenshot...")
        await page.screenshot(path="/home/jules/verification/car_details_modal.png")
        print("Screenshot saved to /home/jules/verification/car_details_modal.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
