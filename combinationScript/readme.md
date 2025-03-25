# Image Combination Script Documentation

This script processes image combinations based on configurations provided in JSON files. It resizes images to a fixed height, aligns them with a specified spacing, and saves the combined output in a specified directory.

## Configuration File (`config.json`)
The configuration file should contain the following fields:
```json
{
  "input_folder": "path/to/input/images",
  "output_folder": "path/to/output",
  "collection_name": "example_collection",
  "images_max_heigh": 200,
  "images": {
    "keyword1": "image1.png",
    "keyword2": "image2.png"
  },
  "spacing": 10
}
```

- `input_folder`: Directory where source images are stored.
- `output_folder`: Directory where output images will be saved.
- `collection_name`: Name for the collection folder inside the output directory.
- `images_max_heigh`: Maximum height for resized images.
- `images`: Mapping of keywords to image file names.
- `spacing`: Pixel spacing between combined images.


## Combinations File (`combinations.json`)
Defines which images should be combined and their output names.
```json
{
  "combinations": [
    {
      "output_name": "result1",
      "images": ["keyword1", "keyword2"]
    },
    {
      "output_name": "result2",
      "images": ["keyword2", "keyword3"]
    }
  ]
}
```
- `output_name`: Name of the final image file.
- `images`: List of keywords corresponding to images in `config.json`.


## Error Handling
If any images are missing, the script will display an error message:
```
⚠️ ERROR: Some images from the combination 'result1' were not found: ['input_folder/image1.png', 'input_folder/image2.png']
```
The missing images will be skipped, and processing will continue with the next combination.



## Running the Script
Execute the script using:
```sh
python script.py
```
Ensure `config.json` and `combinations.json` are correctly configured before running.

## Notes
- The script ensures images maintain aspect ratio when resized.
- If the output directory does not exist, it will be created automatically.
- Images are combined in the order listed in `combinations.json`.
- The output images maintain transparency (RGBA mode).