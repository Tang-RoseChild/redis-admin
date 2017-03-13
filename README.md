# redis-admin
golang + vue + elementui 实现简单的redis后台管理
* 支持自定义分隔符
* 可修改field和值
* 可直接运行redis命令

# 使用方法
clone下来后，直接运行目录中的可执行文件。
也可源代码安装(但不太推荐，目前对前端不熟练，尤其是nmp,webpace之类的，碰到坑的话，那就下去看看吧):

via curl
> sh -c "$(curl -fsSL https://raw.githubusercontent.com/Tang-RoseChild/redis-admin/master/install.sh)"

via wget
> sh -c "$(wget https://raw.githubusercontent.com/Tang-RoseChild/redis-admin/master/install.sh -O -)"


默认端口号9092.再浏览器中输入localhost:9092即可

# 示例
![](https://github.com/Tang-RoseChild/redis-admin/blob/master/images/home.png)
![](https://github.com/Tang-RoseChild/redis-admin/blob/master/images/peizhi.png)
![](https://github.com/Tang-RoseChild/redis-admin/blob/master/images/xiugai.png)
![](https://github.com/Tang-RoseChild/redis-admin/blob/master/images/cmd.gif)
#目录结构
backend:golang代码  
front:前端界面代码  
install.sh源代码安装脚本  
static:front编译后的dist文件夹  

## TODO
* 添加类似kibana的控制台
