import os
import json
from PIL import Image

def resize_image(image, fixed_height):
    ratio = fixed_height / image.height
    new_size = (int(image.width * ratio), fixed_height)
    return image.resize(new_size)

def combine_images(images, fixed_height, spacing, output_path):
    resized_images = [resize_image(Image.open(img), fixed_height=fixed_height) for img in images]
    total_width = sum(img.width for img in resized_images) + spacing * (len(images) - 1)
    
    
    combined_image = Image.new("RGBA", (total_width, fixed_height), (255, 255, 255, 0))
    
    
    x_offset = 0
    for img in resized_images:
        combined_image.paste(img, (x_offset, 0))
        x_offset += img.width + spacing
    
    
    combined_image.save(output_path)

def process_combinations(config_file, combinations_file):    
    
    with open(config_file, "r") as file:
        config = json.load(file)
    
    
    with open(combinations_file, "r") as file:
        combinations_data = json.load(file)
    
    
    input_folder = config["input_folder"]  
    output_folder = config["output_folder"]
    collection_name = config["collection_name"]
    fixed_height = config["images_max_heigh"]
    images_mapping = config["images"]
    spacing = config["spacing"]

    os.makedirs(output_folder, exist_ok=True)
    
    collection_output_folder = os.path.join(output_folder, collection_name)
    os.makedirs(collection_output_folder, exist_ok=True)

    
    for combination in combinations_data["combinations"]:
        
        image_files = [os.path.join(input_folder, images_mapping[keyword]) for keyword in combination["images"]]
        
        output_name = f"{combination['output_name']}-{collection_name}.png"
        output_path = os.path.join(collection_output_folder, output_name)        

        if all(os.path.exists(img) for img in image_files):
            combine_images(image_files, fixed_height, spacing, output_path)
        else:
            print(f"⚠️ ERROR: Some images from the combination '{combination['output_name']}' were not found!")


process_combinations("config.json", "combinations.json")
