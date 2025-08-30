

const infoList = [{
    url: 'huo',
    radius: 388 / 4, // 轨道半径
    correction: {
        x: 0,
        y: 18 // 修正值
    },
    img: {
        width: 926, // 星球的宽高
        height: 997,
        coefficient: 300 // 星球半径
    }
}, {
    url: 'di',
    radius: 518 / 4, // 轨道半径
    correction: {
        x: 0,
        y: 0 // 修正值
    },
    img: {
        width: 530, // 星球的宽高
        height: 502,
        coefficient: 380 // 星球半径
    }
}, {
    url: 'hei',
    radius: 288 / 4, // 轨道半径
    correction: {
        x: 0,
        y: 0 // 修正值
    },
    img: {
        width: 42, // 星球的宽高
        height: 55,
        coefficient: 30 // 星球半径
    }
}, {
    url: 'jin',
    radius: 458 / 4, // 轨道半径
    correction: {
        x: 8,
        y: 0 // 修正值
    },
    img: {
        width: 421, // 星球的宽高
        height: 395,
        coefficient: 380 // 星球半径
    }
}, {
    url: 'yun',
    radius: 288 / 4, // 轨道半径
    correction: {
        x: 0,
        y: 0 // 修正值
    },
    img: {
        width: 42, // 星球的宽高
        height: 55,
        coefficient: 30 // 星球半径
    }
}, {
    url: 'ceres',
    radius: 388 / 4, // 轨道半径
    correction: {
        x: 0,
        y: 0 // 修正值
    },
    img: {
        width: 186, // 星球的宽高
        height: 180,
        coefficient: 150 // 星球半径
    }
}, {
    url: 'wei',
    radius: 388 / 4, // 轨道半径
    correction: {
        x: 0,
        y: 0 // 修正值
    },
    img: {
        width: 187, // 星球的宽高
        height: 187,
        coefficient: 80 // 星球半径
    }
}, {
    url: 'shui',
    radius: 388 / 4, // 轨道半径
    correction: {
        x: 0,
        y: 0 // 修正值
    },
    img: {
        width: 329, // 星球的宽高
        height: 337,
        coefficient: 300 // 星球半径
    }
}, {
    url: 'mu',
    radius: 488 / 4, // 轨道半径
    correction: {
        x: 2,
        y: -2 // 修正值
    },
    img: {
        width: 500, // 星球的宽高
        height: 501,
        coefficient: 300 // 星球半径
    }

},
/*{
    url: 'hd',
    radius: 300 / 4,
    correction: {
        x: 0,
        y: -2
    }, // 修正值
    img: {
        width: 236,
        height: 236,
        coefficient: 150
    },
    angle: 340,
    stayTime: 1000 // 黑洞正常的停留时间
  },*/
{
    url: 'yun2',
    radius: 250 / 4,
    correction: {
        x: -4,
        y: -3
    }, // 修正值
    img: {
        width: 375,
        height: 391,
        coefficient: 150
    },
    angle: 30
}, {
    url: 'yun1',
    radius: 250 / 4,
    correction: {
        x: -2,
        y: 0
    }, // 修正值
    img: {
        width: 422,
        height: 440,
        coefficient: 150
    },
    angle: 325
}, {
    url: 'tu',
    radius: 438 / 4,
    correction: {
        x: 3,
        y: -2
    }, // 修正值
    img: {
        width: 853,
        height: 882,
        coefficient: 300
    },
    angle: 0
    /*friends: [{
        angle: 90 + 90 + 90,
     }],*/

}, {
    url: 'yun3',
    radius: 200 / 4,
    correction: {
        x: 0,
        y: -2
    }, // 修正值
    img: {
        width: 300,
        height: 300,
        coefficient: 150
    },
    angle: 330
}, {
    url: 'yun4',
    radius: 169 / 4,
    correction: {
        x: 0,
        y: -2
    }, // 修正值
    img: {
        width: 300,
        height: 300,
        coefficient: 150
    },
    angle: 330
}, {
    url: 'yun3',
    radius: 175 / 4,
    correction: {
        x: 0,
        y: -2
    }, // 修正值
    img: {
        width: 300,
        height: 300,
        coefficient: 150
    },
    angle: 10
}, {
    url: 'hai',
    radius: 500 / 4, //圆半径
    correction: {
        x: 0,
        y: -2
    }, // 修正值
    img: {
        width: 846,
        height: 823,
        coefficient: 280 // 贴图半径
    },
    angle: 15
},
/*    {
        url: 'hd',
        radius: 300 / 4,
        correction: {
            x: 0,
            y: -2
        }, // 修正值
        img: {
            width: 236,
            height: 236,
            coefficient: 150
        },
        angle: 340,
        stayTime: 3000 // 黑洞正常的停留时间,3000停留久一点
    },*/
{
    url: 'tian',
    radius: 450 / 4,
    correction: {
        x: 3,
        y: 3
    }, // 修正值
    img: {
        width: 819,
        height: 828,
        coefficient: 300
    },
    angle: 15
},
/*   {
       url: 'hd',
       radius: 300 / 4,
       correction: {
           x: 0,
           y: -2
       }, // 修正值
       img: {
           width: 236,
           height: 236,
           coefficient: 150
       },
       angle: 10,
       stayTime: 3500
   },*/
{
    url: 'ming',
    radius: 400 / 4,
    correction: {
        x: -1,
        y: 3
    }, // 修正值
    img: {
        width: 790,
        height: 792,
        coefficient: 300
    },
    angle: 350
}, {
    url: 'out0',
    radius: 400 / 4,
    correction: {
        x: 0,
        y: 0
    }, // 修正值
    img: {
        width: 290,
        height: 290,
        coefficient: 100
    }
}
];

// 使用 map 函数处理数据，确保只执行一次
const processedInfoList = infoList.map(item => ({
    ...item,
    radius: item.radius * window.devicePixelRatio,
    img: {
        width: item.img.width * window.devicePixelRatio,
        height: item.img.height * window.devicePixelRatio,
        coefficient: item.img.coefficient * window.devicePixelRatio
    },
    correction: {
        x: item.correction.x * window.devicePixelRatio,
        y: item.correction.y * window.devicePixelRatio
    }
}));

const gameConfig = {
    // 游戏界面宽度
    GameWidth: 414 * window.devicePixelRatio,

    // 游戏界面高度
    GameHeight: 736 * window.devicePixelRatio,

    // 网格行数
    ROWS: 20,

    // 网格列数
    COLOUMS: 10,

    // 游戏模式
    model: 'vertical',

    // 开始定时器间隔
    startTimerInterval: 1000,

    // 起始X坐标
    startX: 414 / 2 * window.devicePixelRatio,

    // 起始Y坐标
    startY: -80 * window.devicePixelRatio,

    // 星球数据
    planets: processedInfoList,

    // 星球大小缩放
    planetSizeScale: 2,

    // 资源URL前缀
    PREFIX_URL: 'XingTu/res/',
    LOCAL_URL: 'XingTu/res',
    APPID: 'wx7a727ff7d940bb3f',
};

function getRandomNumber(max, step) {
    return ~~(Math.random() * (max + 1)) + (step || 0);
}

export { gameConfig, processedInfoList as infoList, getRandomNumber };