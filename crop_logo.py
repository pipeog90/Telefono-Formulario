from PIL import Image

logo_path = r'c:\Users\pipeo\Documents\Telefono Formulario\public\logo.png'
img = Image.open(logo_path)
print(f'Original Size: {img.size}, Mode: {img.mode}')

if img.mode != 'RGBA':
    img = img.convert('RGBA')

bbox = img.getbbox()
print(f'Bounding box: {bbox}')
print(f'Top whitespace: {bbox[1]}px')
print(f'Bottom whitespace: {img.size[1] - bbox[3]}px')
print(f'Left whitespace: {bbox[0]}px')
print(f'Right whitespace: {img.size[0] - bbox[2]}px')

cropped = img.crop(bbox)
print(f'Cropped Size: {cropped.size}')

cropped.save(logo_path)
print('Saved cropped logo!')

dist_path = r'c:\Users\pipeo\Documents\Telefono Formulario\dist\logo.png'
cropped.save(dist_path)
print('Saved to dist too!')
