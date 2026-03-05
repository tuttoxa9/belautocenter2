import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        car_url = "http://localhost:3000/catalog/qv2EuxryYHgebipXHEUC"
        print(f"Navigating to {car_url}...")
        await page.goto(car_url, wait_until='networkidle')

        # Take screenshot
        print("Taking debug screenshot...")
        await page.screenshot(path="/home/jules/verification/debug_car_details.png")
        print("Screenshot saved to /home/jules/verification/debug_car_details.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
