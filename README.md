# PrivacyManager

Note : This is a pre-version of the readme, made for persons hungry to test this wonderful tool.

<h2>Install</h2>
- If you don't already have nwjs, download the SDK build : <code>https://github.com/nwjs/nw.js</code>.
- Make sure your selfspy data are in you home folder, in .selfspy.
- Clone.
- Move to PrivacyManager folder.
- Create a symbolic link :<br>
<code>cd public/images</code><br>
<code>ln -s ~/.selfspy/screenshots screenshots</code><br>
<code>cd ../..</code>
- Install dependencies : <code>npm install</code>.<br/><br/>
 <b>Warning:</b> <br/>Sqlite3 needs to be installed like this:
  - First install nw-gyp globally: <br/>
    <code>npm install nw-gyp -g</code> (unless already installed)<br/>
  - Build the module<br/>
    <code>npm install sqlite3 --build-from-source --runtime=node-webkit --target_arch=x64 --target="NODE_WEBKIT_VERSION"</code>
    with NODE_WEBKIT_VERSION="0.12.2" at the moment of writing the README # see latest version at https://github.com/nwjs/nw.js#downloads
<br/><br/>
<b>Warning:</b> <br/>
As long as we have not found any other solution, you have to comment a code line, in express-db library :
 - Go to node_modules/express-db/lib/express-db.js
 - Replace the line number 53 :
 - <code>console.log.apply(this, args);</code>
 - Should be
 - <code>//console.log.apply(this, args);</code>
 - This is due to the normal usage of window.console.log instead of console.log on server-side og this node-webkit project.
- Start it with nwjs : <code>path_to_nwjs_folder/nwjs.app/Contents/MacOS/nwjs . </code>
- Enjoy !
