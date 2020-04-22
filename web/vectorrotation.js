//Internally, points are rotated by 90 degrees. Why? No idea. cx, cy are pivot points
//https://stackoverflow.com/a/2259502/2883842
function rotate_point(cx, cy, angle, p)
{
  var s = Math.sin(angle);
  var c = Math.cos(angle);

  // translate point back to origin:
  p.x -= cx;
  p.y -= cy;

  // rotate point
  var xnew = p.x * c - p.y * s;
  var ynew = p.x * s + p.y * c;

  // translate point back:
  p.x = xnew + cx;
  p.y = ynew + cy;
  return p;
}

//TODO: repeated code
function fixEntityRotation(entity) {
	var rotated = rotate_point(0, 0, -90, {x: entity.x, y: entity.y})
	entity.x = rotated.x
	entity.y = rotated.y * -1 //Y coordinates are inverted for some reason
	
	//if target position exists
	if (entity.xTarget) {
		var rotated = rotate_point(0, 0, -90, {x: entity.xTarget, y: entity.yTarget})
		entity.xTarget = rotated.x
		entity.yTarget = rotated.y * -1 
	}
	
}