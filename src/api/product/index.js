// 把所有的接口整合到一起,然后一起去暴露

// 引入并暴露的方式, default引入时不能简写
export {default as trademark} from './trademark'
export {default as attr} from './attr'
export {default as category} from './category'
export {default as sku } from './sku';
export {default as spu } from './spu';


// 最终的暴露形式

// {
//     trademark,
//     attr
// }