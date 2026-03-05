import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Use a larger viewport to see more of the page
        page = await browser.new_page(viewport={"width": 1280, "height": 1080})

        car_url = "http://localhost:3000/catalog/qv2EuxryYHgebipXHEUC"
        print(f"Navigating to {car_url}...")

        try:
            await page.goto(car_url, wait_until='domcontentloaded', timeout=10000)
            await page.wait_for_timeout(3000)
        except Exception as e:
            print(f"Goto Exception: {e}")
            pass

        print("Scrolling down...")
        await page.evaluate("window.scrollBy(0, 800)")
        await page.wait_for_timeout(1000)

        # Take screenshot of the middle of the page
        print("Taking debug screenshot...")
        await page.screenshot(path="/home/jules/verification/debug_car_details3.png")
        print("Screenshot saved to /home/jules/verification/debug_car_details3.png")

        # Attempt to click the "В лизинг" button
        try:
            leasing_btn = page.locator('button:has-text("В лизинг")').first
            await leasing_btn.click(timeout=5000)
            print("Clicked 'В лизинг' button.")
            await page.wait_for_timeout(2000)

            # Take screenshot of the drawer
            print("Taking drawer screenshot...")
            await page.screenshot(path="/home/jules/verification/car_details_drawer.png")
            print("Drawer screenshot saved.")
        except Exception as e:
            print(f"Failed to click button: {e}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
