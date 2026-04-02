from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.goto("http://localhost:3000/adminbel")
    page.wait_for_timeout(2000)

    try:
        page.get_by_text("Добавить авто").click()
        page.wait_for_timeout(1000)
    except:
        print("Could not find 'Добавить авто'")
        pass

    try:
        page.get_by_text("Фото").click()
        page.wait_for_timeout(1000)
    except:
        print("Could not find 'Фото'")
        pass

    try:
        file_input = page.locator("input[type='file']")
        file_input.set_input_files(["dummy1.jpg", "dummy2.jpg"])
        print("Uploaded files via set_input_files")
        page.wait_for_timeout(4000)
    except Exception as e:
        print(f"File upload error: {e}")

    page.screenshot(path="/home/jules/verification/screenshots/upload_both.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    if not os.path.exists("dummy1.jpg"):
        with open("dummy1.jpg", "wb") as f:
            f.write(b"dummy image 1")
    if not os.path.exists("dummy2.jpg"):
        with open("dummy2.jpg", "wb") as f:
            f.write(b"dummy image 2")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
