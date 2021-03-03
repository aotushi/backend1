// 品牌相关接口请求函数
import request from '@/utils/request';

export default {
    // 每一个接口请求函数
    //delete /admin/product/baseTrademark/remove/{id}
    // post  /admin/product/baseTrademark/save
    // put  /admin/product/baseTrademark/update
    // get  /admin/product/baseTrademark/{page}/{limit}

    delete(id) {
        // axios对象写法,第一个参数永远是路径;第二个参数要看请求方式:如果是post和put请求第二个参数是请求体参数(一个对象),如果是其他请求,第二个参数是一个配置对象,一般不写.
        // 
        return request.delete(`/admin/product/baseTrademark/remove/${id}`)
    },

    //无论是增还是改,都需要一个请求体参数,这个参数就是品牌对象.但这两个请求方式搜传递的品牌对象是不同的,如果是增加,品牌对象里面没有id;如果是修改品牌对象里有id

    addOrUpdate(trademark) {
        if (trademark.id) {
            // id存在证明是修改
            return request.put('/admin/product/baseTrademark/update', trademark)
        } else {
            // id不存在证明是添加
            return request.post('/admin/product/baseTrademark/save', trademark);
        }
    },

    getPageList(page, limit) {
        return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
    },

    //获取所有的品牌列表 GET /admin/product/baseTrademark/getTrademarkList
    getList() {
        return request.get('/admin/product/baseTrademark/getTrademarkList')
    }

}