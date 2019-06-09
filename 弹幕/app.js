App({
  onLaunch: function () {
    // 展示本地存储能力
    var that = this;
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
    that.gologin();
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res=> {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    wx.getSystemInfo({
      success: res => {
        this.globalData.systemInfo = res;
      },
      fail: res => {
        this.globalData.systemInfo.windowheight = '600';
      }
    })
  },
  gologin: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.systemInfo = res;
        that.globalData.windowWidth = res.windowWidth;
        that.globalData.windowHeight = res.windowHeight;
        wx.getUserInfo({
          success: function (data) {
            res = Object.assign(res, data.userInfo);
            wx.request({
              url: 'https://weixin.tphoto.cn/micro/first/getdevice',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              method: 'POST',
              data: res,
              success: function (deviceres) {
                wx.login({
                  success: function (getres) {
                    if (getres.code) {
                      res.js_code = getres.code;
                      res.appinit = 1;
                      res.appid = that.globalData.appid;
                      wx.request({
                        url: 'https://weixin.tphoto.cn/micro/user/getuser',
                        data: res,
                        header: {
                          'content-type': 'application/x-www-form-urlencoded'
                        },
                        method: 'POST',
                        dataType: 'json',
                        success: function (logindata) {
                          //res = Object.assign(res, logindata.data);
                          if (logindata.data.openid){
                            wx.setStorageSync('userid', logindata.data.openid);
                          }
                          if (logindata.data.session_id) {
                            wx.setStorageSync('sessid', logindata.data.session_id);
                          }                          
                          
                        }
                      })
                    } else {
                      console.log('login fail');
                    }
                  }
                })
              },
              fail: function (res) { },
              complete: function () { }
            })
          }
        })
      },
      fail: function (res) { }
    });
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },
  globalData: {
    userInfo: null,
    systemInfo: null,
    appid:1,
    windowWidth: null,
    windowHeight: null
  }
})
