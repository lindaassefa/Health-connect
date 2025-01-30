import pytesseract
from PIL import Image

# Set the Tesseract command path
pytesseract.pytesseract.tesseract_cmd = r'/opt/homebrew/bin/tesseract'

# Path to your test image
image_path = '/Users/lindaberhe/Desktop/l.png'  # Update this to the exact path of your image

try:
    # Open the image
    image = Image.open(image_path)
    
    # Perform OCR on the image
    text = pytesseract.image_to_string(image)
    print("Extracted Text:", text)

except Exception as e:
    print("Error during OCR extraction:", e)
