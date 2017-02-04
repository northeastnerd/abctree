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
  this.node_num = 0;
  this.id = id;
  this.nodes = [];
  this.indent = 0;
  this.table = document.createElement("table");
  this.table.id = id;
  this.selected = null;
  this.root = this;

  // insert the html element into the DOM
  document.getElementById(parent_id).appendChild(this.table);

  // return a pointer to the tree for manipulation and traversal
  return this;
};

// add a node at the top level of the tree
abctree.prototype.add_child = function(id, val, user_cb, after){
  "use strict";
  var kid = new abctree_node(this, id, val);
  this.nodes.push(kid);
  kid.select();
  var sel_cb = kid.make_callback(kid.select, kid);
  var other_cb;
  if(typeof user_cb == "function")
    other_cb = kid.make_callback(user_cb, id);
  else
    other_cb = function(){};
  var cb_fn = function(){sel_cb(); other_cb();};
  kid.table_row.children[1].onclick = cb_fn;
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

// UI asked to collapse the whole tree
abctree.prototype.collapse_all = function(item){
  "use strict";
  if(item == null)
    item = this;
  var i, nodes = item.all_below();
  for(i = 0; i < nodes.length; i++)
    nodes[i].collapse(nodes[i]);
};

// abctree_node = nodes in the tree = entries
var abctree_node = function(parent, id, val, after){
  "use strict";
  var x, new_row, l, tid, all, insert_point;
  if(typeof after == "undefined")
    after = null;
  this.root = parent.root;
  this.id = this.root.id + "." + this.root.node_num++;
  this.nodes = [];
  this.parent = parent;
  this.indent = 0;
  this.collapsed = true;
  this.table = parent.table;
  this.val = val;
  l = parent.table.rows.length;
  if(after != null){
    all = [];
    all.push(after);
    all = all.concat(after.all_below());
    tid = all[all.length - 1].id;
  }
  else if(parent.nodes.length == 0)
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
  new_row.id = this.id;
  new_row.innerHTML = "<div id=" + this.id + ".img></div><td id=" + this.id + ".val>" + val + "</td>";
  new_row.children[0].className = "abctree_leaf";
  this.table_row = new_row;
  return this;
};

// make node invisible on page
abctree_node.prototype.hide = function(){
  "use strict";
  this.table_row.style.display = "none";
};

// make node visible on page
abctree_node.prototype.show = function(){
  "use strict";
  this.table_row.style.display = "block";
};

// user clicked on selection
abctree_node.prototype.select = function(opt){
  "use strict";
  var me;
  if(opt)
    me = opt;
  else
    me = this;
  if(me.root.selected != null)
    me.root.selected.deselect();
  me.root.selected = me;
  me.table_row.children[1].className = "abctree_selected";
};

// user clicked on selection
abctree_node.prototype.deselect = function(){
  "use strict";
  this.table_row.children[1].className = "abctree_deselected";
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
  if(item.table_row.children[0].className != "abctree_leaf"){
    item.table_row.children[0].className = "abctree_collapsed";
    item.collapsed = true;
    var below = item.all_below();
    below.forEach(function(e){e.hide();});
  }
};

// user clicked, expand the tree below this node
abctree_node.prototype.expand = function(item){
  "use strict";
  if(item.table_row.children[0].className != "abctree_leaf"){
    item.table_row.children[0].className = "abctree_expanded";
    item.collapsed = false;
    var below = item.nodes;
    var below = below.concat(item.all_below("expanded"));
    below.forEach(function(e){e.show();});
  }
};

// user clicked, either expand or collapse based on state
abctree_node.prototype.toggle_expanded = function(item){
  "use strict";
  if(item.table_row.children[0].className == "abctree_expanded")
    item.collapse(item);
  else if(item.table_row.children[0].className == "abctree_collapsed")
    item.expand(item);
};

// save the instance info for later clicks
abctree_node.prototype.make_callback = function(call, arg){
  "use strict";
  var ret = function(){return call(arg);};
  return ret;
}

// add a child node beneath this one
abctree_node.prototype.add_child = function(id, val, user_cb, after){
  "use strict";
  var child = new abctree_node(this, id, val, after);
  child.indent = this.indent + 10;
  child.table_row.style.margin = "0px 0px 0px " + child.indent + "px";
  child.table_row.style.display = "none";
  child.parent = this;
  child.root = this.root;
  this.table_row.children[0].className = "abctree_collapsed";
  var sel_cb = this.make_callback(this.toggle_expanded, this);
  this.table_row.children[0].onclick = sel_cb;
  sel_cb = child.make_callback(child.select, child);
  var other_cb;
  if(typeof user_cb == "function")
    other_cb = child.make_callback(user_cb, id);
  else
    other_cb = function(){};
  var cb_fn = function(){sel_cb(); other_cb();};
  child.table_row.children[1].onclick = cb_fn;
  this.nodes.push(child);
  child.select();
  this.expand(this);
  return child;
}

// add a child node beneath this one
abctree_node.prototype.delete = function(){
  "use strict";
  var x, nodes, list = this.all_below();
  for(x = 0; x < this.table.rows.length; x++)
    if(this.table.rows[x].id == this.id){
      this.table.deleteRow(x);
      break;
    }
  for(x = 0; x < this.parent.nodes.length; x++)
    if(this.parent.nodes[x] == this){
      nodes = this.parent.nodes.slice(0, x);
      nodes = nodes.concat(this.parent.nodes.slice(x + 1));
      this.parent.nodes = nodes;
    }
  for(x = 0; x < list.length; x++)
    list[x].delete();
}

// search function
abctree_node.prototype.get_child_by_id = function(id){
  "use strict";
  for(var x = 0; x < nodes.length; x++)
    if(nodes[x].id == id)
      return nodes[x];

  return null;
}