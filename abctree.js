/*
License information: MIT License

Copyright (c) Chris Schalick 2015 All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Tree structure code creates an object hierarchy on demand
inside an HTML table, allows click to expand / collapse
to view and traverse the hierarchy.
*/

var abctree_style = document.createElement("style");
abctree_style.type = "text/css";
abctree_style.innerHTML = ".abctree_leaf { background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AMfEi8WbCB2GQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAYElEQVQY032QuQ2AMBAEZxE5ZVERufshpwQ6cAFUQEy0BLYlm8cjbbY3dzqRsc0Xkhhygx4qpV4tmdZW/2QE4ATNC0xHx7c73WVDCNhuktZd1UCMP6bNEPwylOjvgvpvNwXXOMpWayahAAAAAElFTkSuQmCC\"); width: 9px; height: 9px; float: left; margin: 3px; }";
document.getElementsByTagName("head")[0].appendChild(abctree_style);
abctree_style = document.createElement("style");
abctree_style.type = "text/css";
abctree_style.innerHTML = ".abctree_expanded { background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAIAAABv85FHAAAAT0lEQVQImWNowA0YGhoarn7+j4kQcq9//n/98//bX//f/Pz/5uf/17+Q5N78/P/2FwpCyDG6VSEjFLlPv3Hb9/UPOkKR+/EXKgphQOVwAQAPSLGYw3tZHAAAAABJRU5ErkJggg==\"); width: 9px; height: 9px; float: left; margin: 3px; }";
document.getElementsByTagName("head")[0].appendChild(abctree_style);
abctree_style = document.createElement("style");
abctree_style.type = "text/css";
abctree_style.innerHTML = ".abctree_collapsed { background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAIAAABv85FHAAAAXElEQVQImXXNQQrAIAwEQP1cHuUpn/QVxksl0FjL9qBQpXXZw8IE4ngfx8yx4NvXkiEZPAUxiCHVycSQKzyFWJAr8myewtzFjgv94uefNmgb1vdi5w1tiGWMYbs8uiCoqOdNhIkAAAAASUVORK5CYII=\"); width: 9px; height: 9px; float: left; margin: 3px; }";
document.getElementsByTagName("head")[0].appendChild(abctree_style);
abctree_style = document.createElement("style");
abctree_style.type = "text/css";
abctree_style.innerHTML = ".abctree_selected { background-color: #e0e0e0; cursor: pointer; font-family: 'Arial'; font-size: 14px; }";
document.getElementsByTagName("head")[0].appendChild(abctree_style);
abctree_style = document.createElement("style");
abctree_style.type = "text/css";
abctree_style.innerHTML = ".abctree_deselected { background-color: null; cursor: pointer; font-family: 'Arial'; font-size: 14px; }";
document.getElementsByTagName("head")[0].appendChild(abctree_style);

// abctree = root of the tree = table
var abctree = function(id, parent_id){
  "use strict";
  this.id = id;
  this.nodes = [];
  this.indent = 0;
  this.elem = document.createElement("table");
  this.elem.id = id;
  this.selected = null;

  // insert the html element into the DOM
  document.getElementById(parent_id).appendChild(this.elem);

  // return a pointer to the tree for manipulation and traversal
  return this;
};

abctree.prototype.node = function(id, val, user_cb){
  "use strict";
  var kid = new abctree_node(this, this.elem, id, val);
  kid.tree = this;
  this.nodes.push(kid);
  kid.select();
  var sel_cb = kid.make_callback(kid.select, kid);
  var other_cb;
  if(typeof user_cb == "function")
    other_cb = kid.make_callback(user_cb, id);
  else
    other_cb = function(){};
  var cb_fn = function(){sel_cb(); other_cb();};
  kid.elem.children[1].onclick = cb_fn;
  return kid;
};

// get all nodes in the tree
abctree.prototype.all_below = function(){
  "use strict";
  var below = [];
  for(var x = 0; x < this.nodes.length; x++)
    below.push(this.nodes[x]);
  for(var x = 0; x < this.nodes.length; x++)
    below = below.concat(this.nodes[x].all_below());

  return below;
};

// abctree_node = nodes in the tree = entries
var abctree_node = function(parent, table, id, val){
  "use strict";
  var x, new_row, l, tid, all, insert_point;
  this.id = id;
  this.nodes = [];
  this.parent = parent;
  this.indent = 0;
  this.collapsed = true;
  this.table = table;
  l = table.rows.length;
  if(parent.nodes.length == 0)
    tid = parent.id;
  else {
    all = parent.all_below();
    tid = all[all.length - 1].id;
  }
  insert_point = this.table.rows.length;
  for(x = 0; x < l; x++){
    if(this.table.rows[x].id == tid){
      insert_point = x + 1;
      break;
    }
  }
  new_row = this.table.insertRow(insert_point);
  new_row.style.display = "block";
  new_row.id = id;
  new_row.innerHTML = "<div id=" + id + ".img></div><td id=" + id + ".val>" + val + "</td>";
  new_row.children[0].className = "abctree_leaf";
  this.elem = new_row;
  return this;
};

// make node invisible on page
abctree_node.prototype.hide = function(){
  "use strict";
  this.elem.style.display = "none";
};

// make node visible on page
abctree_node.prototype.show = function(){
  "use strict";
  this.elem.style.display = "block";
};

// user clicked on selection
abctree_node.prototype.select = function(opt){
  "use strict";
  var me;
  if(opt)
    me = opt;
  else
    me = this;
  if(me.tree.selected != null)
    me.tree.selected.deselect();
  me.tree.selected = me;
  me.elem.children[1].className = "abctree_selected";
};

// user clicked on selection
abctree_node.prototype.deselect = function(){
  "use strict";
  this.elem.children[1].className = "abctree_deselected";
};

// get either all nodes below or all nodes in the
// next level down plus all nodes in expanded nodes
// beyond that
abctree_node.prototype.all_below = function(filter){
  "use strict";
  var below = [];

  for(var x = 0; x < this.nodes.length; x++){

    // add immediate children
    below.push(this.nodes[x]);

    // add children's children
    if(typeof filter == "undefined")
      below = below.concat(this.nodes[x].all_below(filter));
    else if((filter == "expanded") && (!this.nodes[x].collapsed))
      below = below.concat(this.nodes[x].all_below(filter));
  }

  return below;
};

// user clicked, collapse the tree below this node
abctree_node.prototype.collapse = function(item){
  "use strict";
  if(item.elem.children[0].className != "abctree_leaf"){
    item.elem.children[0].className = "abctree_collapsed";
    item.collapsed = true;
    var below = item.all_below();
    below.forEach(function(e){e.hide();});
  }
};

// user clicked, expand the tree below this node
abctree_node.prototype.expand = function(item){
  "use strict";
  if(item.elem.children[0].className != "abctree_leaf"){
    item.elem.children[0].className = "abctree_expanded";
    item.collapsed = false;
    var below = item.nodes;
    var below = below.concat(item.all_below("expanded"));
    below.forEach(function(e){e.show();});
  }
};

// user clicked, either expand or collapse based on state
abctree_node.prototype.toggle_expanded = function(item){
  "use strict";
  if(item.elem.children[0].className == "abctree_expanded")
    item.collapse(item);
  else if(item.elem.children[0].className == "abctree_collapsed")
    item.expand(item);
};

// save the instance info for later clicks
abctree_node.prototype.make_callback = function(call, arg){
  "use strict";
  var ret = function(){return call(arg);};
  return ret;
}

// add a child node beneath this one
abctree_node.prototype.add_child = function(id, val, user_cb){
  "use strict";
  var child = new abctree_node(this, this.table, id, val);
  child.indent = this.indent + 10;
  child.elem.style.margin = "0px 0px 0px " + child.indent + "px";
  child.elem.style.display = "none";
  child.parent = this;
  child.tree = this.tree;
  this.elem.children[0].className = "abctree_collapsed";
  var sel_cb = this.make_callback(this.toggle_expanded, this);
  this.elem.children[0].onclick = sel_cb;
  sel_cb = child.make_callback(child.select, child);
  var other_cb;
  if(typeof user_cb == "function")
    other_cb = child.make_callback(user_cb, id);
  else
    other_cb = function(){};
  var cb_fn = function(){sel_cb(); other_cb();};
  child.elem.children[1].onclick = cb_fn;
  this.nodes.push(child);
  child.select();
  return child;
}

// search function
abctree_node.prototype.get_child_by_id = function(id){
  "use strict";
  for(var x = 0; x < nodes.length; x++)
    if(nodes[x].id == id)
      return nodes[x];

  return null;
}