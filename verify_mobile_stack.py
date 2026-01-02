from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        # iPhone 12 Pro dimensions
        iphone = p.devices['iPhone 12 Pro']
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(**iphone)
        page = context.new_page()

        print("Navigating to home page...")
        try:
            page.goto("http://localhost:3000", timeout=60000)

            print("Waiting for network idle...")
            page.wait_for_load_state("networkidle")

            # Check for JS errors
            page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))
            page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

            print("Taking initial screenshot...")
            page.screenshot(path="mobile_stack_initial.png")

            # Look for the stack component text
            print("Checking for stack UI elements...")
            # We look for "Смахните" which is in the mobile stack helper text
            if page.get_by_text("Смахните").first.is_visible():
                print("SUCCESS: Stack UI text found.")
            else:
                print("WARNING: Stack UI text NOT found. Checking skeletons...")
                if page.locator(".animate-pulse").count() > 0:
                    print("Skeletons detected. Content might still be loading.")

            # Try to swipe
            # We need to find the top card. The stack cards are usually car cards.
            # In mobile-car-stack.tsx, the card has class 'cursor-grab' when top.

            top_card = page.locator(".cursor-grab").first
            if top_card.is_visible():
                print("Found top card. Swiping...")
                box = top_card.bounding_box()
                if box:
                    # Swipe right
                    page.mouse.move(box["x"] + box["width"]/2, box["y"] + box["height"]/2)
                    page.mouse.down()
                    page.mouse.move(box["x"] + box["width"] + 150, box["y"] + box["height"]/2, steps=10)
                    page.mouse.up()

                    time.sleep(1)
                    page.screenshot(path="mobile_stack_swiped.png")
                    print("Swipe performed. Screenshot saved.")
            else:
                print("Top card not found (or not visible).")

        except Exception as e:
            print(f"Error during execution: {e}")
            page.screenshot(path="error_state.png")

        finally:
            browser.close()

if __name__ == "__main__":
    run()
