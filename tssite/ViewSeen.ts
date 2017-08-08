import * as seen from '../tssrc/index'
let shape = seen.Shapes.icosahedron() as seen.Shape
shape.translate(10,10)
let shape2 = seen.Shapes.cube().scale(100) as seen.Shape
let shape3 = seen.Shapes.text("测试",{'stroke':'red'}).scale(30) as seen.Shape
let scene = new seen.Scene()
scene.model = seen.Models.default().add(shape)
scene.viewport = seen.Viewports.center(500, 500)
let context = seen.Context('myView', scene).render()
let A: any = 0;
let dragger = new seen.Drag('myView', { inertia: true })
dragger.on('drag.rotate', (e: seen.IdragEvent) => {
    let xform = seen.Quaternion.xyToTransform(e.offsetRelative[0],e.offsetRelative[1])
    scene.model.transform(xform)
    context.render()
})
new seen.Animator().onFrame((t, dt) =>{
    shape.rotx(dt*3e-4)
    context.render()
}).start()