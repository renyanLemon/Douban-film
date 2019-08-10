
//初始化数据库
const db = wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    content: '', //评价内容
    score: 5, //评价分数
    images: [], //上传图片
    fileIds: [],
    movieid: ''

  },

  submit: function() {
    wx.showLoading({
      title: '提交中...',
    })
    // 上传图片到云存储
    let promiseArr = []
    for (let i = 0; i < this.data.images.length; i++) {
      promiseArr.push(new Promise((reslove, reject) => {
        let item = this.data.images[i]
        //正则表达式，返回文件的扩展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + suffix, //上传至云端的路径
          filePath: item,  //小程序临时文件路径
          success: res => {
            this.setData({
              fileIds: this.data.fileIds.concat(res.fileID)
            })
            reslove()
          },
          fail: console.error
        })
      }))
    }
    //需求：等到所有的Promise函数都执行完之后再插入数据库
    //Promise.all()，参数传入一个数组，等到数组所有任务都执行之后，在执行then中的代码
    Promise.all(promiseArr).then(res => {
      // 插入数据
      db.collection('comment').add({
        data: {
          content: this.data.content,
          score: this.data.score,
          movieid: this.data.movieid,
          fileIds: this.data.fileIds
        }
      }).then(res => {
        wx.showToast({
          title: '评价成功',
        })
        wx.hideLoading()
      })
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '评价失败',
      })
    })
  },

  uploadImg: function() {
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePaths = res.tempFilePaths
        console.log('tempFilePaths',tempFilePaths)
        this.setData({
          images: this.data.images.concat(tempFilePaths)
        })
      }
    })
  },

  onContentChange: function(event) {
    this.setData({
      content: event.detail
    })
  },

  onScoreChange: function(event) {
    this.setData({
      score:event.detail
    })
  },

  getPhoto: function (options) {
    wx.cloud.callFunction({
      name: 'getPhoto',
      data: {
        movieid: options.movieid
      }
    }).then(res => {
      this.setData({
        photo: JSON.parse(res.result)
      })
    }).catch(err => {

    })
  },

  getComment: function (options) {
    wx.cloud.callFunction({
      name: 'getDetail',
      data: {
        movieid: options.movieid
      }
    }).then(res => {
      this.setData({
        detail: JSON.parse(res.result)
      })
    }).catch(err => {
      console.log(err)
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      movieid: options.movieid
    })
    this.getPhoto(options)
    this.getComment(options)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})