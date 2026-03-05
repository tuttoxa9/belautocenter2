import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        car_url = "http://localhost:3000/catalog/qv2EuxryYHgebipXHEUC"
        print(f"Navigating to {car_url}...")
        # Use a much looser wait_until and force a timeout if needed, but grab screenshot regardless
        try:
            await page.goto(car_url, wait_until='domcontentloaded', timeout=10000)
            await page.wait_for_timeout(3000) # wait 3 seconds to let client render
        except Exception as e:
            print(f"Goto Exception: {e}")
            pass

        # Take screenshot
        print("Taking debug screenshot...")
        await page.screenshot(path="/home/jules/verification/debug_car_details2.png")
        print("Screenshot saved to /home/jules/verification/debug_car_details2.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
