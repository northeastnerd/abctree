// Copyright (c) 2016 Chris Schalick

var root;
window.onload = function(){
  var one, two, three, four;
  root  = new abctree("the_tree", "tree_goes_here");

  // top level tree node
  one   = root.node("1", "1 - First Chapter");

  // nodes below top
  two   = one.add_child("1.1", "1.1 - Intro", show_selected);
  three = two.add_child("1.1.1", "1.1.1 - Aside", show_selected);
  two   = one.add_child("1.2", "1.2 - Discussion", show_selected);
  three = two.add_child("1.2.1", "1.2.1 - Experts", show_selected);

  // another top node
  one   = root.node("2", "2 - Second Chapter", show_selected);

  // more lower noodes, not added in order
  four  = three.add_child("1.2.1.1", "1.2.1.1 - Newton", show_selected);
  four  = three.add_child("1.2.1.2", "1.2.1.2 - Plato", show_selected);
  four  = three.add_child("1.2.1.3", "1.2.1.3 - Gauss", show_selected);
  two   = one.add_child("2.1", "2.1 - Why it Happened", show_selected);
}

function get_selected(){document.getElementById("sel").innerHTML = root.selected.id;};
function show_selected(id){document.getElementById("hl").innerHTML = id;};