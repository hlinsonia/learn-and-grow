const app = getApp()
var common = require('../../common/js/common.js');

Page({

  data: {
    isload:0,
    items:[
      
    ],
    list_bf : [],
    screenH:0
  },
  onLoad: function (e) {
    var that = this;
    var source_data = this.data;    
    common.init.apply(that, []);    
    this.onShow = function () {
      wx.setNavigationBarTitle({
        title: that.data.title
      })
      if (that.data.isload == 0) {
        that.loadChat();
      }
    };
    this.setData(Object.assign(source_data, common.init.data));
    this.data.title = '对方正在输入...';
    this.data.isload = 1;
    this.data.appid = app.globalData.appid;
    this.mergeQuery(e);
    this.getCurl({
      url:'https://weixin.tphoto.cn/micro/phoneverthrid/chatdata',
      data:{
        'verify':'tlhz2018haonb'
      },
      success:function(res){
          for (var i in res.data) {
            res.data[i].content = res.data[i].content.toString().replace(/@n@/g, '\n');
          }
          that.setData({
            list_bf: res.data
          }, function(){
            that.loadChat();
            var query = wx.createSelectorQuery();
            query.select('#screenVisible').boundingClientRect();
            query.selectViewport();
            query.exec(function (res) {
              that.setData({
                screenH: res[0].height
              })
            });
          });
      }
    })
    
    
  },
  loadChat:function(){
    var that = this;
    var list_bf = this.data.list_bf;
    +function () {
      var bf = 1;
      let items = [];
      items = items.concat(list_bf.slice(0, 1));
      that.setData({
        items: items
      });
      that.st = setInterval(function () {
        items = that.data.items;
        if (bf == list_bf.length - 1) {
          items = items.concat(list_bf.slice(bf));
        } else {
          items = items.concat(list_bf.slice(bf, bf + 1));
        }
        that.setData({
          items: items
        }, function(){
          that.scrollPageBottom();
        });
        bf += 1;
        if (bf >= list_bf.length) {
          wx.setNavigationBarTitle({
            title: '对方正在等待您回复',
          })
          clearInterval(that.st);
        }
      }, 3000);
    }();
  },
  onReady: function () {

  },
  onHide: function () {
    this.setData({
      items:[],
      isload:0
    });
    clearInterval(this.st)
  },
  onUnload: function () {
    this.setData({
      items: []
    });
    clearInterval(this.st)
  },
  scrollPageBottom:function(){
    var that = this;
    var c = wx.createSelectorQuery().select('#container');
    c.boundingClientRect(function (rect) {
      if(typeof rect.height != null && rect.height > that.data.screenH){
        wx.pageScrollTo({
          scrollTop: rect.height
        })
      }
      
    }).exec();
  },
  onPullDownRefresh: function () {
  
  },
  onReachBottom: function () {
  
  },
  onShareAppMessage: function () {
    common.init.onShareAppMessage.apply(this);
  }
})