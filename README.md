# :bowtie: A simple personal site #

Hi, this is the code of [my personal site](https://xulioze.com/). Really It's quite simple and it was made with HTML, CSS (SCSS) and some JavaScript, but inside it there are some features that maybe could interest you:

*  I've used [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) (and its fallbacks).
*  For the classes names I've followed [BEM methodology](http://getbem.com/).
*  The CSS has been compiled under [ITCSS architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/).

So if you want to see the code, try it or reuse for another project, feel free to do it :wink:

## :tractor: How to run this ##

Well, this is quite old school :grimacing:

1.  Fork this repository clicking on the ```Fork``` button on the top right of this page.
2.  Clone your forked repository to download it in your local machine.

    ```sh
    git clone https://github.com/[YOUR-USERNAME]/cv.git
    ```
    
3.  Open the ```index.html``` in your favourite browser.

Easy, isn't it?

## :mage: How to compile the CSS ##

There are many ways to compile CSS but for this project I tested node-sass, a package of node.js that do it really well.

If you want to test it, follow this instructions:

1.  [Install Node](https://nodejs.org/en/download/) in your computer.
2.  Go to the project and initialize npm:

    ```sh
    cd the/path/of/project/
    npm init
    ```
    
    You will be prompted to answer several questions about the project, after which npm will generate a package.json file in your folder.
    
3.  Install node-sass:

    ```sh
    npm install sass --save-dev
    ```
    
    By using `--save-dev` we are specifying in the package.json the `sass` like [devDependencies](https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file) because in this case it only needed for local development and testing.
    
4.  Open the `package.json` and add the `sass` commands in the scripts section, under the test command:

    ```json
    "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1",
        "build": "sass --style=compressed scss:css",
        "watch": "sass --watch --style=compressed scss:css"
    }
    ```
    
    *  `sass`: Refers to the node-sass package.
    *  `--watch`: Flag which means “watch all .scss files in the scss/ folder and recompile them every time there’s a change.”
    *  `--style=compressed`: Flag that indicates how the css should compile.
    *  `scss`: The folder where we put all our .scss files.
    *  `css`: The output folder for our compiled CSS.

5.  Now, the magic: Run the Script!

    ```sh
    npm run compile
    ```

## :mage: How to minify the JS ##

https://www.npmjs.com/package/uglify-js

1.  Install uglifyjs

    ```
    npm install uglify-js -g
    ```

2.  Command line usage

    ```
    uglifyjs --compress --mangle -- js/application.js
    ```

## :copyright: Licenses ##

This project is under [GNU GPLv3 license](https://www.gnu.org/licenses/gpl-3.0.html)

Sawton, the beautiful font from [Atipo Foundry](https://www.atipofoundry.com), is under [its own license](https://www.atipofoundry.com/license). If you want to use it, you need to [buy it](https://www.atipofoundry.com/fonts/sawton).
