<template>
	<div>
		<!-- CategorySelecrot -->
    <!-- 
      三级分类:
      1.一级中的数据是发请求获取的
     -->

		<el-form :inline="true"  class="demo-form-inline" :model="cForm" :disabled="!isShowList">
		
			<el-form-item label="一级分类">
        <!-- select, option需要一个value否则报错  使用v-model代替value-->
				<el-select v-model="cForm.category1Id" placeholder="请选择" @change="handlerCategory1">

					<el-option v-for="(c1,index) in category1List" :key="c1.id" :label="c1.name" :value="c1.id"></el-option>
				</el-select>
			</el-form-item>

      	<el-form-item label="二级分类">
        <!-- select, option需要一个value否则报错  使用v-model代替value-->
				<el-select v-model="cForm.category2Id" placeholder="请选择" @change="handlerCategory2">

					<el-option v-for="(c2,index) in category2List" :key="c2.id" :label="c2.name" :value="c2.id"></el-option>
				</el-select>
			</el-form-item>

      	<el-form-item label="三级分类">
        <!-- select, option需要一个value否则报错  使用v-model代替value-->
				<el-select v-model="cForm.category3Id"  placeholder="请选择" @change="handlerCategory3">

					<el-option v-for="(c3,index) in category3List" :key="c3.id" :label="c3.name" :value="c3.id"></el-option>
				</el-select>
			</el-form-item>
		
		</el-form>
	</div>
</template>

<script>
export default {
	name: "CategorySelector",
  data(){
    return {
      category1List:[],
      category2List:[],
      category3List:[],
      cForm:{
        category1Id:'',
        category2Id:'',
        category3Id:''
      }
    }
  },
  props:['isShowList'],
  mounted(){
    this.getCategoryList1();
  },
  methods:{
    async getCategoryList1(){
      const result = await this.$API.category.getCategory1();
      if(result.code === 200){
        this.category1List = result.data
      }
    },
    // 选中了1级分类的回调 必须是使用change关键字
    async handlerCategory1(category1Id){
      // 解决再次选择数据没有清楚的bug 清空2级数据  
      this.category2List = [];
      this.category3List = [];
      this.cForm.category2Id = '';
      this.cForm.category3Id = '';

      // 触发自定义事件,把1级id传递给父组件 不能传递category1Id形式,父组件无法区分
      // this.$emit('handlerCategory', category1Id);
      this.$emit('handlerCategory', {categoryId:category1Id, level:1});

      const result = await this.$API.category.getCategory2(category1Id);
      if(result.code === 200){
        this.category2List = result.data
      }
    },
    // 选中了2级分类的回调
    async handlerCategory2(category2Id){
      // 解决再次选择数据没有清楚的bug 清空3级数据
      this.category3List = [];
      this.cForm.category3Id = '';

      // 触发自定义事件,把2级id传递给父组件
      this.$emit('handlerCategory', {categoryId:category2Id, level:2});

      const result = await this.$API.category.getCategory3(category2Id);
      if(result.code === 200){
        this.category3List = result.data
      }
    },
    // 3级分类回调
    handlerCategory3(category3Id){

      // 触发自定义事件,把3级id传递给父组件
      this.$emit('handlerCategory', {categoryId:category3Id, level:3});
    }

  }
};
</script>

