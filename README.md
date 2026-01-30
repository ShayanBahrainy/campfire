# Campfire
This is a game I made where you play as a Snowball falling in a forest. Your goal is to dodge various obstacles (fires, trees, etc.) I built this in Typescript, porting over my JavaScript core from Sean's Game. I spent a significant time reworking the collision detection to be more efficient, and reliable. Now, it supports any combination of convex polygons, rectangles, and circles.

# Structure
The repository is split into two main folders. `Extension` is where the Chrome extension lives. It's very minimal, and is basically just a `manifest.json`. `Game` is where the game portion of the project lives. It's mostly TypeScript files, and the dist folder is the compiled JavaScript. The `package.json` contains a `build-extension` script that will compile the TypeScript, and automatically copy it into the `Extension` folder to keep it up to date.

I'm pretty happy with how the engine works, so I keep reusing, and improving it in projects. Because this version is in TypeScript, it's a bit less prone to bugs than the old JavaScript version. There are a lot of times problems arise because I forget to add a specific property, and this helps avert that.

# Running
You can either load the `Extension` folder as an unpacked Chrome extension, or alternatively, you can run the game with `electron .`

# Learning
This was my first experience with TypeScript, and while it is an improvement over JavaScript, for me it's still annoying to work with. I also learned a lot reimplementing the collision code. It was fun because it involved some math, and felt refreshing compared to a lot of the debugging I was doing. It was also frustrating at times when issues were small, and hard to spot, but fundementally broke collisions.

It wasn't very hard but I also enjoyed writing the code for making the camera follow an object. It resulted in some interesting edge cases a while after I wrote it, and that was refreshing compared to the usual enslaught of bugs as soon as I "*complete*" a feature.

Next time, I want to expand the scope of the project. I'm prone to creating neverending projects that either fizzle out, or are neverending. This project however seems to be small, as much as I want to keep working on it, the game simply doesn't have space for more features or content. It's reptitive, but there is not much space to change that as most obstacles would just be a different shape to dodge.

As much as I think this project could have been more, I'm also glad to finish it, as I want to move on to other things. As they say, the first 90% of the project is just 10% of the effort, it's the last 10% that gets you.
