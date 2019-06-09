const util = require('../../utils/util.js');
const common = require('../../common/js/common.js');
const app = getApp();
var videonowtime = 0;
var socketTask;
Page({
  data: {
    bartitle:'',
    userInfo: {},
    submitstatus: "",
    array: [],
    arrayCityIndex: [],
    index: "0",
    inputUsersVal: '',
    inputPhoneVal: '',
    inputContactVal: '',
    waring: "",
    waringArr: [],
    banarUrl: [],
    footImageUrl: [],
    sd: "",
    auto: "",
    isHandler: true,
    isformtj: false,
    disabled: false,
    isvideo: 'none',
    danmutext: '',
    lastdanmutext: '',
    formid: 15,
    isconnect: 0,
    isend:0,
    isfirst:0,
    connectid: '',
    getdanmulist:[],
    getdanmucopy: [],
    danmulist:[],
    advertitle:'',
    advertid:0,
    clickid: '',
    weixinadinfo: '',
    mpmark: '',
    ispaly:false
  },
  danmu_func: function (){
    var ms = 0;
    var that = this;
    if (that.data.getdanmucopy.length < 1 || that.data.isend) {
      this.data.getdanmucopy = null;
      this.data.getdanmucopy = that.clone(that.data.getdanmulist);
    } 
    var danmulist = that.data.getdanmucopy;
    
    var danmu_loop = function () {      
      var st = setTimeout(function () {
        for (var i in danmulist) {
          var t = danmulist[i].time * 1000;
          if (t - ms <= 100) {
            that.videoContext.sendDanmu(danmulist[i]);
            danmulist.splice(i, 1);
          }       
        }
        ms += 100;
        if (ms > 60000) {
          clearTimeout(st);
          return;
        }
        danmu_loop();
      }, 100);
    };
    danmu_loop();
  },
  onLoad: function (e) {
    var that = this;
    var storePhone = wx.getStorageSync('phone');
    wx.login({
      success: res => {
        app.globalData.code = res.code
        //取出本地存储用户信息，解决需要每次进入小程序弹框获取用户信息
        app.globalData.userInfo = wx.getStorageSync('userInfo')
        //wx.getuserinfo接口不再支持
        wx.getSetting({
          success: (res) => {
            //判断用户是否授权，需要弹框
            if (storePhone == '') {
              that.setData({
                PshowModel: true,
                // UshowModel: true,
              })
            } else {//没有授权，不需要弹框
              that.setData({
                PshowModel: false,
                // UshowModel: false
              })
              // that.getOP(app.globalData.userInfo)
            }
          },
          fail: function () {
            wx.showToast({
              title: '系统提示:网络错误',
              icon: 'warn',
              duration: 1500,
            })
          }
        })
      },
      fail: function () {
        wx.showToast({
          title: '系统提示:网络错误',
          icon: 'warn',
          duration: 1500,
        })
      }
    })
    var source_data = this.data;
    common.init.apply(that, []);
    this.setData(Object.assign(source_data, common.init.data));
    this.data.title = this.data.bartitle;
    this.data.appid = app.globalData.appid;
    this.mergeQuery(e);
    this.checklogin();
    if (wx.getStorageSync('advertitle')){
      this.setData({
        advertitle: wx.getStorageSync('advertitle')
      });
    }
    if (wx.getStorageSync('advertid')) {
      this.setData({
        advertid: wx.getStorageSync('advertid')
      });
    }
    if (typeof e.advertitle != 'undefined' && e.advertitle != '') {
      this.setData({
        advertitle: e.advertitle
      });
    }
    if (typeof e.advertid != 'undefined' && e.advertid != '') {
      this.setData({
        advertid: e.advertid
      });
    }
    if (typeof e.gdt_vid != 'undefined' && typeof e.weixinadinfo != 'undefined' && e.mpmark != undefined) {
      this.setData({
        clickid: e.gdt_vid,
        weixinadinfo: e.weixinadinfo,
        mpmark: e.mpmark
      });
    }
    wx.request({
      url: 'https://weixin.tphoto.cn/micro/first/listform?witch=' + that.data.formid,
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        console.log(res);
        console.log(res.data.danmulist)
        var arrayCity = res.data.area.split(",");
        var array = [], arrayCityIndex = [];
        for (var i = 0; i < arrayCity.length; i++) {
          var arr = arrayCity[i].split("_");
          array.push(arr[1]);
          arrayCityIndex.push(arr[0]);
        }
        that.setData({          
          danmulist: res.data.danmulist,  
          getdanmulist: res.data.danmulist,         
          getdanmucopy: res.data.danmulist,  
          array: array,
          arrayCityIndex: arrayCityIndex,
          bannerUrl: res.data.banner.split(","),
          footImageUrl: res.data.imgmutil.split(","),
          sd: res.data.sd,
          auto: res.data.auto,
          ispaly: true,
          formtitle: res.data.formtitle,
          nickshot: res.data.nickshot,
          nickphone: res.data.nickphone,
          nickweixin: res.data.nickweixin,
          weixintip: res.data.weixintip,
          submitstatus: res.data.submitfont,
          submitdubble: res.data.submitfont,
          videourl: res.data.videourl
        });
        setTimeout(function () {
          that.socketConnect();
        }, 3000);
      }
    }),
      //调用应用实例的方法获取全局数据
      app.getUserInfo(function (userInfo) {
        //更新数据
        that.setData({
          userInfo: userInfo
        })
      });
    that.onMessage(function (data) {
      var danmu = JSON.parse(data);
      var getdanmulist = that.data.getdanmulist;
      //console.log(danmu);
      //console.log(getdanmulist);
      that.setData({
        getdanmulist: getdanmulist.push(danmu)
      });
      //that.videoContext.sendDanmu(danmu);
    });
  },
  onReady: function (res) {
    this.videoContext = wx.createVideoContext('tvideo')
  },
  playcontinue:function(res){
    this.danmu_func();
  },
  
  playend:function(res){
    this.setData({
      isend:1
    });

  },
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  inputUsers: function (e) {
    this.setData({
      inputUsersVal: e.detail.value
    })
  },
  /*inputPhone: function (e) {
    this.setData({
      inputPhoneVal: e.detail.value
    })
  },*/
  inputContact: function (e) {
    this.setData({
      inputContactVal: e.detail.value
    })
  },
  inputContactFocus: function () {
    if (this.data.inputPhoneVal.replace('/\s+/g', '').length == 11 && this.data.inputContactVal.replace('/\s+/g') == '' && this.data.isHandler) {
      var that = this;
      wx.showActionSheet({
        itemList: ['是我手机号', '不是'],
        success: function (res) {
          if (res.tapIndex == 0) {
            that.setData({
              inputContactVal: that.data.inputPhoneVal
            })
          } else {
            that.data.isHandler = false;
          }
        }
      })
    }
    //console.log(this.data.isHandler)
  },
  //获取用户手机号接口
  agreeGetPhoneNumber: function (e) {
    var that = this;
    wx.login({
      success: (res) => {
        var reqdata = {
          'encryptedData': e.detail.encryptedData,
          'iv': e.detail.iv,
          'code': res.code
        };
        wx.request({
          url: 'https://weixin.tphoto.cn/micro/user/wxcGetUserPhone',
          data: reqdata,
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          method: 'POST',
          dataType: 'json',
          success: function (phonedata) {
            wx.setStorageSync('phone', phonedata.data.phoneNumber);
            var phone = wx.getStorageSync('phone');
            if (typeof phonedata.data.phoneNumber == 'undefined') {
              that.setData({
                PshowModel: false
              })
            } else {

              that.setData({
                PshowModel: false
              })
              var sd = that.data.sd;
              if (that.data.advertid > 0) {
                sd = that.data.advertid;
              }
              wx.request({
                url: 'https://weixin.tphoto.cn/micro/first/submit',
                data: { 'phone': phone, 'sd': sd },
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                  console.log(res)
                }, fail: function (res) {
                  console.log('fail');
                }
              })
            }
          }
        });
      }
    })
  },
  isSubmit: function (e) {
    this.setData({
      waring: ""
    });
    var phone = this.data.inputPhoneVal;
    var weixin = this.data.inputContactVal.replace('/\s+/g', '');
    if (!phone && !weixin) {
      this.setData({
        waring: "手机微信任选一个"
      });
      wx.showToast({
        title: '手机微信任选一个',
        image: '../../common/icon/frozen.png'
      });
    } else if (phone != '') {
      phone = parseInt(phone);
      if (isNaN(phone) || phone.toString().length != 11) {
        this.setData({
          waring: "手机号码不正确"
        });
      }
    } else if (this.data.isformtj) {
      this.setData({
        waring: "您已经提交过了"
      });
    }
    if (!!this.data.waring) {
      /*wx.showToast({
        title: this.data.waring,
        icon: 'loading',
        duration: 1500
      })*/
      wx.showToast({
        title: this.data.waring,
        image: '../../common/icon/frozen.png'
      });
    } else {
      this.setData({
        submitstatus: "请等待..."
      })
      var that = this;
      var postdata = {};
      postdata.rm = '拍摄地：' + this.data.array[this.data.index];
      postdata.phone = phone;
      postdata.weixin = weixin;
      postdata.name = this.data.inputUsersVal;
      postdata.sd = this.data.sd;
      if(this.data.advertid > 0) {
        postdata.sd = this.data.advertid;
      }
      if (this.data.advertitle != '') {
        postdata.rm += '<br/>' + this.data.advertitle;
      }
      postdata.at = this.data.auto;
      postdata.ps = this.data.arrayCityIndex[this.data.index];
      this.data.isformtj = true;
      this.setData({
        disabled: true
      });
      wx.request({
        url: 'https://weixin.tphoto.cn/micro/first/submit',
        data: postdata,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          if (res.status > 0) {
            var title = "提示";
            var content = "提交失败，请稍候再试";
          } else {
            var title = "提示";
            var content = "恭喜您已提交成功，我们的客服会尽快与您联系";
            that.setData({
              inputUsersVal: "",
              inputPhoneVal: "",
              inputContactVal: ""
            });
            if (typeof (that.data.clickid) != '' && typeof (that.data.weixinadinfo) != '' && that.data.mpmark != '') {
              wx.request({
                url: 'https://weix.tphoto.cn/WxMp/upMpdata',
                data: {
                  clickid: that.data.clickid,
                  wxinfo: that.data.weixinadinfo,
                  ul: 'http://www.qq.com'
                },
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (d) {
                  console.log(d);
                  console.log('success');
                },
                fail: function (d) {
                  console.log(d)
                }
              })
            }
          }
          wx.showModal({
            title: title,
            content: content,
            showCancel: false
          })
        },
        complete: function () {
          that.setData({
            submitstatus: that.data.submitdubble
          })
        }
      })
    }
  },
  getPhoneNumber: function (e) {
    var that = this;
    var sessid = wx.getStorageSync('sessid');
    this.getPhone(function () {
      if (typeof e.detail.encryptedData != 'undefined') {
        var reqdata = {
          'encryptedData': e.detail.encryptedData,
          'sess_uid': encodeURIComponent(sessid),
          'iv': e.detail.iv,
          'appid': app.globalData.appid
        };
        //console.log('get sessid ' + sessid);
        //console.log(reqdata);
        wx.request({
          url: 'https://weixin.tphoto.cn/micro/user/getUserPhone',
          data: reqdata,
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          method: 'POST',
          dataType: 'json',
          success: function (phonedata) {
            wx.setStorageSync('phone', phonedata.data.phoneNumber);
            //console.log(phonedata);
            if (typeof phonedata.data.phoneNumber == 'undefined') {
              wx.showToast({
                title: '手机获取失败，请再试一次',
                image: '../../common/icon/frozen.png'
              });
            } else {
              that.setData({
                inputPhoneVal: phonedata.data.phoneNumber
              });
            }
          },
          fail:function(data){
            console.log('手机请求获取失败');
            console.log(data);
          }
        });
      } else {
        console.log('get phone faile');
      }
    });
  },
  getInput: function (e) {
    this.setData({
      danmutext: e.detail.value
    });
  },
  getvideotime: function (e) {
    videonowtime = e.detail.currentTime;
  },
  getvideoend: function (e) {
    videonowtime = 0;
  },
  userdata: function () {
    var that = this;
    var userid = encodeURIComponent(wx.getStorageSync('sessid'));
    return { userid: userid, formid: that.data.formid, socket_url: 'wss://weixin.tphoto.cn/chat/?id=' + userid + '&formid=' + that.data.formid };
  },
  socketConnect: function (func) {
    var that = this;
    var userid = that.userdata().userid;
    var socket_url = that.userdata().socket_url;
    that.connectSocket(socket_url, function () { });
    wx.onSocketOpen(function (res) {
      that.data.isconnect = 1;
      if (typeof func == 'function') {
        func();
      }
      console.log('WebSocket 已打开')
    });
    wx.onSocketError(function (res) {
      that.data.isconnect = 0;
      console.log('WebSocket 连接打开失败，请检查！')
    });
    wx.onSocketClose(function (res) {
      that.data.isconnect = 0;
      console.log('WebSocket 已关闭！');
    });
  },
  bindSendDanmu: function () {
    var danmutext = this.data.danmutext;
    var lastdanmutext = this.data.lastdanmutext;
    this.setData({
      danmutext: ''
    });
    //var getdanmulist = this.data.danmulist;
    if (!danmutext) {
      wx.showToast({
        title: '请输入弹幕内容',
        image: '../../common/icon/frozen.png'
      });
    } else if (videonowtime <= 0) {
      wx.showToast({
        title: '视频未播放',
        image: '../../common/icon/frozen.png'
      });
    } else if (lastdanmutext != '' && lastdanmutext == danmutext) {
      wx.showToast({
        title: '该内容已经发表过了',
        image: '../../common/icon/frozen.png'
      });
    } else {
      this.setData({
        lastdanmutext: danmutext
      });
      var mydanmu = {
        text: danmutext,
        color: util.getRandomColor(),
        time: videonowtime
      };
      var danmu = {
        text: danmutext,
        color: util.getRandomColor(),
        time: videonowtime,
        formid: this.data.formid
      };
      //getdanmulist.push(mydanmu);
      //this.videoContext.sendDanmu(mydanmu);
      var that = this;
      mydanmu.sessid = encodeURIComponent(wx.getStorageSync('sessid'));
      mydanmu.openid = encodeURIComponent(wx.getStorageSync('userid'));
      mydanmu.formid = this.data.formid;
      wx.request({
        url: 'https://weixin.tphoto.cn/micro/first/setDanmu',
        data: mydanmu,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        dataType: 'json',
        success: function (res) {
          if (res.data.status == 1) {
            //getdanmulist.push(danmu);
            that.videoContext.sendDanmu(danmu);
            console.log(that.data.isconnect);
            //console.log(danmu);
            if (that.data.isconnect == 1) {
              that.sendMessage(JSON.stringify(danmu));
            } else {
              that.socketConnect(function () {
                that.sendMessage(JSON.stringify(danmu));
              });
            }
          } else {
            wx.showToast({
              title: '发表失败',
              image: '../../common/icon/frozen.png'
            });
          }
        }
      })
    }
  },
  onShareAppMessage: function (res) {
    common.init.onShareAppMessage.apply(this);
  }
})
