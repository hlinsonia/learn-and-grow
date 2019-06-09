const init = function () {
  var that = this;
  String.prototype.trim = function (char, type) {
    if (char) {
      if (type == 'left') {
        return this.replace(new RegExp('^\\' + char + '+', 'g'), '');
      } else if (type == 'right') {
        return this.replace(new RegExp('\\' + char + '+$', 'g'), '');
      }
      return this.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
    }
    return this.replace(/^\s+|\s+$/g, '');
  };
  this.clone = function(obj) {
    var copy;
    if (null == obj || "object" != typeof obj) return obj;
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.clone(obj[i]);
      }
      return copy;
    }
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
      }
      return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
  };
  this.data = {
    bartitle: '',
    title: '',    
    'dressactive': 0,
    'styleactive': 0,
    'placeactive': 0,
    'formname': '',
    'formweixin': '',
    'formnumber': '',
    'dressscrl': 0,
    'stylescrl': 0,
    'placescrl': 0,
    'query': {},
    'isformtj': false,
    'advertitle': '',
    'isloading': 0,
    'windowHeight': 0,
    'windowWidth': 0
  },
  this.wechat = function (event) {
    //console.log(event);
  },
    this.extend = function () {
      var extended = {};
      var deep = false;
      var i = 0;
      var length = arguments.length;
      if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
        deep = arguments[0];
        i++;
      }
      var merge = function (obj) {
        for (var prop in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
              extended[prop] = extend(true, extended[prop], obj[prop]);
            } else {
              extended[prop] = obj[prop];
            }
          }
        }
      };
      for (; i < length; i++) {
        var obj = arguments[i];
        merge(obj);
      }
      return extended;
    },
    this.getCurl = function (arg) {
      var defOptions = {
        'method': 'POST',
        'header': { 'content-type': 'application/x-www-form-urlencoded' },
        'dataType': 'json',
        'success': function () { },
        'fail': function () { },
        'complete': function () { }
      }
      arg = this.extend(defOptions, arg);
      if (arg.method.toUpperCase() == 'POST') {
        if (typeof arg.data != 'object') {
          arg.data = {};
        }
        arg.data.verify = 'tlhz2018haonb';
      }
      wx.request({
        url: arg.url,
        data: arg.data,
        header: arg.header,
        method: arg.method,
        dataType: arg.dataType,
        success: function (res) {
          arg.success(res);
        },
        fail: function (res) {
          arg.fail(res);
        },
        complete: function (res) { arg.complete(res); }
      })
    },
    this.mergeQuery = function (obj) {
      this.data.query = Object.assign(this.data.query, obj);
      if (typeof obj.advertid != 'undefined' && obj.advertid > 0) {
        wx.setStorageSync('advertid', obj.advertid);
        this.data.advertid = obj.advertid;
      }
      if (wx.getStorageSync('advertid')) {
        this.data.advertid = wx.getStorageSync('advertid');
      }
      if (typeof obj.advertitle != 'undefined') {
        wx.setStorageSync('advertitle', obj.advertitle);
        this.data.advertitle = obj.advertitle;
        this.setData({ advertitle: obj.advertitle });
      }
      if (wx.getStorageSync('advertitle')) {
        this.data.advertitle = wx.getStorageSync('advertitle');
      }
      this.checklogin();
      wx.setNavigationBarTitle({
        title: this.data.title
      });
    },
    this.checklogin = function () {
      var that = this;
      if (!wx.getStorageSync('sessid')) {
        this.getPhone();
      } else {
        wx.checkSession({
          success: function () {
            console.log('session is not expire.1');
            //console.log('sessid', wx.getStorageSync('sessid'));
            if (!wx.getStorageSync('sessid')) {
              console.log('login, get sessid');
              that.getLogin();
            }
          },
          fail: function () {
            console.log('session is expire.1');
            that.getPhone();
          }
        })
      }
    },
    this.getPhone = function (callback) {
      var that = this;
      wx.checkSession({
        success: function () {
          console.log('session is not expire.2');
          if (!wx.getStorageSync('sessid')) {
            if (typeof callback == 'function') {
              that.getLogin(callback);
            } else {
              that.getLogin();
            }
          } else {
            typeof callback == 'function' && callback();
          }
        },
        fail: function () {
          console.log('session is expire.2');
          if (typeof callback == 'function') {
            that.getLogin(callback);
          } else {
            that.getLogin();
          }
        }
      })
    },
    this.getLogin = function(callback){
      var that = this;
      wx.login({
        success: function (res) {
          if (res.code) {
            if (wx.getStorageSync('sessid')) {
              res.sess_uid = encodeURIComponent(wx.getStorageSync('sessid'));
            }
            //console.log(res);
            res.inpage = 1;
            res.appid = 1;
            res.js_code = res.code;
            //console.log('post user ');
            //console.log(res);
            wx.request({
              url: 'https://weixin.tphoto.cn/micro/user/getuser',
              data: res,
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              method: 'POST',
              dataType: 'json',
              success: function (logindata) {
                console.log('login session 1');
                console.log(logindata);
                if (logindata.data.openid) {
                  wx.setStorageSync('userid', logindata.data.openid);
                }
                if (logindata.data.session_id) {
                  wx.setStorageSync('sessid', logindata.data.session_id);
                }
                if (typeof callback == 'function') {
                  callback();
                }
              }
            })
          } else {
            console.log('login fail');
          }
        }
      });
    },
    this.onShareAppMessage = function (res) {
      var title = this.data.title;
      if (typeof this.path == 'undefined') {
        var str = '';
        for (var name in this.options) {
          str += name + '=' + this.options[name] + '&';
        }
        str = str.trim('&', 'right');
        this.path = this.route + '?' + str;
        this.path = this.path.trim('?', 'right');
      }
      return {
        title: title,
        path: this.path,
        imageUrl: 'http://static.tphoto.com.cn/common/images/micro/kp/a2.jpg',
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    }
  this.opencamera = function () {
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths;
        wx.saveFile({
          tempFilePath: tempFilePaths[0],
          success: function (res) {
            var savedFilePath = res.savedFilePath;
            console.log(savedFilePath);
          }
        });
      }
    });
  },
    this.startRecord = function () {
      wx.startRecord({
        success: function (res) {
          var tempFilePath = res.tempFilePath;
          console.log(tempFilePath);
        },
        fail: function (res) {
          wx.showModal({
            title: '提示',
            content: '录音失败',
          })
        }
      });
      setTimeout(function () {
        wx.stopRecord()
      }, 15000);
    },
    this.stopRecord = function () {
      wx.stopRecord();
    },
    this.captureScreen = function () {
      if (wx.canIUse("captureScreen")) {
        wx.onUserCaptureScreen(function (res) {
          console.log('用户截屏了')
        })
      }
    },
    this.connectSocket = function (url, func) {
      var userid = encodeURIComponent(wx.getStorageSync('sessid'));
      wx.connectSocket({
        url: url,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        method: "POST",
        success: function (res) {
          if (typeof func == 'function') {
            func();
          }
        },
        fail: function (res) {
          //console.log(res);
        },
        complete: function (data) {
          //console.log(data);
        }
      });
    },
    this.sendMessage = function (msg) {
      if (typeof msg == 'string') {
        msg = [msg]
      }
      wx.sendSocketMessage({
        data: msg,
      })
    },
    this.onMessage = function (func) {
      wx.onSocketMessage(function (res) {
        //console.log(res.data);
        if (typeof func == 'function') {
          func(res.data)
        }
      });
    },
    this.onClose = function (func) {
      wx.onSocketClose(function (res) {
        if (typeof func == 'function') {
          func();
        }
      });
    }
};

module.exports = {
  init: init
};
