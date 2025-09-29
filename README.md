# cloudinary-to-r2
This program is to aim to automate image compression and store in r2 bucket.

# How to Use?
1. Implement `.env.template` and change file name to `.env`
> [!CAUTION]
> To be sure that your R2 API Token is able to use POST method.

2. Setting up your file input folder and prefix
By default, the input folder is set to `./raw`. Create it and put all your images to be processed in it.
If you would like to post the image processed to certain folder, you can setup prefix manually at this moment.

3. Change your convert option used by cloudinary
<img width="701" height="186" alt="image" src="https://github.com/user-attachments/assets/d7eb9676-c853-4416-98c2-cd5ea955d230" />

Those are the options provided by cloudinary. Set to your preferance here.

4. run `node main`
