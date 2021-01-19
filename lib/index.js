/*
 * @Descripttion: 标签云
 * @version:
 * @Author: xiaolanchong
 * @Date: 2021-01-18 15:55:17
 * @LastEditors: xiaolanchong
 * @LastEditTime: 2021-01-19 14:13:30
 * test 均匀分部 θ = arccos( ((2*num)-1)/all - 1); Φ = θ*sqrt(all * π);
 * test 已知半径r和球心   x=r*sinθ*cosΦ   y=r*sinθ*sinΦ   z=r*cosθ;
 * test x轴旋转 y1 = yconsθ - zsinθ; z1 = ysinθ + zcosθ; x1 = x;
 * test y轴旋转 z1 = zconsθ - xsinθ; x1 = zsinθ + xcosθ; y1 = y;
 * test z轴旋转 x1 = xconsθ - ysinθ; y1 = xsinθ + ycosθ; z1 = z
 */

Component({
  options: {
    styleIsolation: 'apply-shared',
    virtualHost: true
  },
  properties: {
    list: {
      type: Array
    }
  },
  data: {
    tags: [],
    width: 0,
    height: 0,
    radius: 0,
    radius: 0,
    isMove: false,
    clientX: 0,
    clientY: 0,
    angleX: Math.PI / 360,
    angleY: Math.PI / 360,
    timer: null
  },
  ready() {
    const query = wx.createSelectorQuery().in(this);
    query
      .select('.tag-cloud-wrapper')
      .boundingClientRect((res) => {
        const { width, height } = res;
        const radius = Math.min(width, height) / 2;
        this.setData({
          width,
          height,
          radius
        });
        this.initialize();
      })
      .exec();
  },
  methods: {
    initialize() {
      const query = wx.createSelectorQuery().in(this);
      query
        .selectAll('.tag-cloud-item')
        .boundingClientRect((res) => {
          let tags = [];
          const { radius } = this.data;
          const tag_len = res.length;
          res.forEach((item, i) => {
            const w = item.width;
            const h = item.height;

            var a = Math.acos((2 * (i + 1) - 1) / tag_len - 1);
            var b = a * Math.sqrt(tag_len * Math.PI);
            var x = radius * Math.sin(a) * Math.cos(b);
            var y = radius * Math.sin(a) * Math.sin(b);
            var z = radius * Math.cos(a);
            const tag = {
              w,
              h,
              x,
              y,
              z
            };
            tags.push(tag);
          });
          this.setData({
            tags
          });
          this.move();
          this.animate();
        })
        .exec();
    },
    move() {
      const { tags, width, height, radius } = this.data;
      tags.forEach((item) => {
        const { x, y, z, w, h } = item;
        const scale = 300 / (300 - z);
        const alpha = (z + radius) / (2 * radius);
        item.transform = `scale(${scale})`;
        item.opacity = `${alpha + 0.5}`;
        item.zIndex = `${parseInt(scale * 100, 10)}`;
        item.left = `${x + width / 2 - w / 2}px`;
        item.top = `${y + height / 2 - h / 2}px`;
      });
      this.setData({
        tags
      });
    },
    rotateX() {
      const { tags, angleX } = this.data;
      const cos = Math.cos(angleX);
      const sin = Math.sin(angleX);
      tags.forEach((item) => {
        const { y, z } = item;
        const y1 = y * cos - z * sin;
        const z1 = z * cos + y * sin;
        item.y = y1;
        item.z = z1;
      });
    },
    rotateY() {
      const { tags, angleY } = this.data;
      const cos = Math.cos(angleY);
      const sin = Math.sin(angleY);
      tags.forEach((item) => {
        const { x, z } = item;
        const x1 = x * cos - z * sin;
        const z1 = z * cos + x * sin;
        item.x = x1;
        item.z = z1;
      });
    },
    animate() {
      this.data.timer = setInterval(() => {
        this.rotateX();
        this.rotateY();
        this.move();
      }, 50);
    },
    touchStart(e) {
      clearInterval(this.data.timer);
      this.data.isMove = true;
      this.data.clientX = e.touches[0].clientX;
      this.data.clientY = e.touches[0].clientY;
    },
    touchMove(e) {
      const { radius, isMove, clientX, clientY } = this.data;
      if (isMove) {
        const c_clientX = e.touches[0].clientX;
        const c_clientY = e.touches[0].clientY;
        const x = c_clientX - clientX;
        const y = c_clientY - clientY;
        this.data.clientX = c_clientX;
        this.data.clientY = c_clientY;
        const ak = x / radius > 1 ? 1 : x / radius < -1 ? -1 : x / radius;
        const a = Math.asin(ak);
        const bk = y / radius > 1 ? 1 : y / radius < -1 ? -1 : y / radius;
        const b = Math.asin(bk);
        this.data.angleX = -b;
        this.data.angleY = -a;
        this.rotateX();
        this.rotateY();
        this.move();
      }
    },
    touchEnd() {
      this.data.isMove = false;
      this.animate();
    }
  }
});
