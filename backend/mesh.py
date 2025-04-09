FREECADPATH = '/usr/lib/freecad/lib/'

import sys
import os
sys.path.append(FREECADPATH)

try:
    import FreeCAD as App
except:
    print("Error importing freecad!")
    sys.exit(1)

import Part, Mesh

def generate(
    wall_thickness = 1.0,
    circular_radius = 10,
    square_width = 50,
    square_height = 30,
    length = 60,
):
    """
    Generates ventilation pipe and returns path
    """
    output_file = "models/pipemesh/" + "ventilation_pipe_{}-{}-{}-{}-{}.stl".format(square_width, square_height, length, circular_radius, wall_thickness)
    # === Create a new hidden document ===
    doc = App.newDocument()

    # === Parameters ===

    # === Outer Profiles ===
    outer_circle = Part.makeCircle(circular_radius, App.Vector(0, 0, 0), App.Vector(0, 0, 1))
    outer_circle_wire = Part.Wire([outer_circle])

    hw = square_width / 2
    hh = square_height / 2
    outer_rect_pts = [
        App.Vector(-hw, -hh, length),
        App.Vector(hw, -hh, length),
        App.Vector(hw, hh, length),
        App.Vector(-hw, hh, length),
        App.Vector(-hw, -hh, length),
    ]
    outer_rect_wire = Part.makePolygon(outer_rect_pts)

    outer_loft = Part.makeLoft([outer_circle_wire, outer_rect_wire], True)

    # === Inner Profiles ===
    inner_circle = Part.makeCircle(circular_radius - wall_thickness, App.Vector(0, 0, 0), App.Vector(0, 0, 1))
    inner_circle_wire = Part.Wire([inner_circle])

    inner_hw = hw - wall_thickness
    inner_hh = hh - wall_thickness
    inner_rect_pts = [
        App.Vector(-inner_hw, -inner_hh, length),
        App.Vector(inner_hw, -inner_hh, length),
        App.Vector(inner_hw, inner_hh, length),
        App.Vector(-inner_hw, inner_hh, length),
        App.Vector(-inner_hw, -inner_hh, length),
    ]
    inner_rect_wire = Part.makePolygon(inner_rect_pts)

    inner_loft = Part.makeLoft([inner_circle_wire, inner_rect_wire], True)

    # === Cut inner from outer ===
    hollow_body = outer_loft.cut(inner_loft)

    # === Add shape to document and export as STL ===
    obj = doc.addObject("Part::Feature", "HollowTaperedAdapter")
    obj.Shape = hollow_body
    doc.recompute()

    # === Export to STL ===
    if not os.path.exists(f"models/pipemesh"):
        os.makedirs("models/pipemesh")

    Mesh.export([obj], output_file)
    print(f"✅ STL exported to: {output_file}")
    return output_file

generate()
