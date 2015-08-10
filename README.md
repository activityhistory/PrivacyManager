# PrivacyManager

Note : This is a pre-version of the readme, made for persons hungry to test this wonderful tool.

<h2>Install</h2>
- If you don't already have nwjs, download it : <code>https://github.com/nwjs/nw.js</code>.
- Make sure your selfspy data are in you home folder, in .selfspy.
- Clone.
- Move to PrivacyManager folder.
- Install dependencies : <code>npm install</code>.<br/><br/>
 <b>Attention:</b> <br/>Sqlite3 need to be install like this:
  - First install nw-gyp globally: <br/>
    <code>npm install nw-gyp -g</code> (unless already installed)<br/>
  - Build the module<br/>
    <code>npm install sqlite3 --build-from-source --runtime=node-webkit --target_arch=x64 --target="NODE_WEBKIT_VERSION"</code>
<br/><br/>
- Start it with nwjs : <code>path_to_nwjs_folder/nwjs.app .</code>.
- Enjoy !
