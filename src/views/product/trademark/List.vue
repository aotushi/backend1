<template>
	<div>
		<el-button type="primary" icon="el-icon-plus" @click="showAddDialog"
			>添加</el-button
		>

		<!-- 
        el-table中的属性:border代表是否需要边框; 
        :data="data"  data数据
        table会把这个数组给每个列传递一份,每个列内部都是展示我们的的这个数组数据 v-for
        每个列在展示数组时,结构是由自己说了算,所以table列内部是有作用域插槽的

        table的列在展示数据时,如果我们的数据就是要展示的数据直接写prop.如果我们的数据不是直接展示的数据,而是需要其他结构,那么必须使用作用域插槽.
       -->
		<el-table
			style="width: 100%; margin: 20px 0"
			border
			:data="trademarkList"
		>
			<el-table-column
				type="index"
				label="序号"
				width="80"
				align="center"
			>
				<!-- 
          prop='prop' 展示数据中的某个属性
          label="label" 代表这一列的名称
          width="width" 代表这一列宽度,直接写数字,不需要px.如果不写,4个列平分宽度
          align 列的对齐方式
          type="index" 展示序列号
         -->
			</el-table-column>
			<el-table-column prop="tmName" label="品牌名称" width="width">
			</el-table-column>
			<el-table-column label="品牌Logo" width="width">
				<template slot-scope="{ row, $index }">
					<!-- 
            传递过来row(当前遍历的对象), $index(当前遍历对象的下标)
           -->
					<img :src="row.logoUrl" style="width: 80px; height: 60px" />
				</template>
			</el-table-column>
			<el-table-column label="操作" width="width">
				<template slot-scope="{ row, $index }">
					<el-button
						type="warning"
						icon="el-icon-edit"
						size="mini"
						@click="showUpdateDialog(row)"
						>修改</el-button
					>
					<el-button
						type="danger"
						icon="el-icon-delete"
						size="mini"
						@click="deleteTrademark(row)"
						>删除</el-button
					>
				</template>
			</el-table-column>
		</el-table>
		<!-- 
        分页器 
        background 按钮格式

        :page-sizes='[10,20,50]'  在页面可以改变当前页的数量
        @size-change="handleSizeChange" 改变当前页数量的事件
        layout='total, sizes, prev, next, jumper' 可以改变分页器前后顺序(布局顺序) 
      -->
		<el-pagination
			background
			style="text-align: center"
			:current-page="page"
			:page-sizes="[3, 5, 10]"
			:page-size="limit"
			layout="prev, pager, next, jumper,->, sizes, total"
			:total="total"
			:pager-count="5"
			@current-change="getTrademarkList"
			@size-change="handleSizeChange"
		>
		</el-pagination>

		<!-- 
      点击添加或修改弹出的对话框页面
      el-form代表的是表单,表单里是表单项,每个表单项可以通过label-width设置表单项名称的宽度
      form当中都会写:model='对象' 作用:1.以后用来对这个form进行表单验证;2.用来标识这个form收集的数据放在哪里
     -->
		<el-dialog
			:title="tmForm.id ? '修改品牌' : '添加品牌'"
			:visible.sync="dialogFormVisible"
		>
			<el-form
				style="width: 80%"
				:model="tmForm"
				:rules="rules"
				ref="tmForm"
			>
				<el-form-item
					label="品牌名称"
					label-width="100px"
					prop="tmName"
				>
					<el-input
						autocomplete="off"
						v-model="tmForm.tmName"
						placeholder="请输入品牌名称(长度在 2 到 20 个字符)"
					></el-input>
				</el-form-item>
				<el-form-item
					label="品牌LOGO"
					label-width="100px"
					v-model="tmForm.logoUrl"
					prop="logoUrl"
				>
					<!-- 
            在upload中,action是上传的接口地址
            上传图片分为2步:1.调用接口上传图片到后端服务器;2.后端服务器返回图片在服务器上的地址
            我们要收集的就是返回来的路径

            上传的接口需要添加/dev-api/,
            show-file-list 代表显示的只有一张图片,不是多个(照片墙)
            on-success 图片上传成功的回调
            before-upload 图片上传前的回调
           -->
					<el-upload
						class="avatar-uploader"
						action="/dev-api/admin/product/fileUpload"
						:show-file-list="false"
						:on-success="handleAvatarSuccess"
						:before-upload="beforeAvatarUpload"
					>
						<img
							v-if="tmForm.logoUrl"
							:src="tmForm.logoUrl"
							class="avatar"
						/>
						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
						<div class="el-upload__tip" slot="tip">
							只能上传jpg/png文件，且不超过500kb
						</div>
					</el-upload>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="cancelUpload('tmForm')" 
					>取 消</el-button
				>
				<el-button type="primary" @click="addOrUpdateTrademark"
					>确 定</el-button
				>
			</div>
		</el-dialog>
	</div>
</template>

<script>
export default {
	name: "Trademark",
	data() {
		var validateTmName = (rule, value, callback) => {
			if (value.length<2 || value.length>20) {
				// value就是后期验证的用户输入的数据
				// callback是回调,如果cb调用时传递了参数,代表验证失败;如果没有传递参数,代表验证成功
				callback(new Error("tmName长度必须是2-20之间"));
			} else {
				callback();
			}
		};
		return {
			// imageUrl: "", //upload组件内部数据,有可能不用
			page: 1,
			limit: 3,
			trademarkList: [],
			total: 0,
			dialogFormVisible: false, //决定<el-dialog>是否显示
			tmForm: {
				// 用来收集数据的
				tmName: "", //收集品牌名称
				logoUrl: "", //收集品牌logo图片路径
			},
			rules: {
				// 规则
				// 每个要验证的字段规则都是一个数组.数组里面是对象,每个对象就是一个规则
				// 每个规则对象里包含3个:1.规则 2.错误提示信息 3.触发时机
				// 触发时机有3种: 1.失去焦点blue 2.内容改变的时候change 3.整体验证时
				tmName: [
					{
						required: true,
						message: "请输入品牌名称(长度在 2 到 20 个字符)",
						trigger: "blur",
					},
					// {
					// 	min: 3,
					// 	max: 5,
					// 	message: "长度在 2 到 10 个字符",
					// 	trigger: "change",
					// },
					// 自定义校验规则,且需在data中定义函数
					{ validator: validateTmName, trigger: "change" },
				],
				logoUrl: [
					{
						required: true,
						message: "请上传图片",
						// trigger: "change", //upload触发是在整体校验时,所以change/blue都是触发不了的
					},
				],
			},
		};
	},
	mounted() {
		this.getTrademarkList();
	},
	methods: {
		async getTrademarkList(page = 1) {
			this.page = page;
			const result = await this.$API.trademark.getPageList(
				this.page,
				this.limit
			);
			if (result.code === 200) {
				this.trademarkList = result.data.records;
				this.total = result.data.total;
			}
		},
		// 切换分页器页码
		// handlerCurrentChange(page){
		//   this.page = page;
		//   this.getTrademarkList();
		// }
		// 切换每一页数量的回调
		handleSizeChange(size) {
			this.limit = size;
			this.getTrademarkList();
		},
		// upload中的两个函数
		// 图片上传成功的回调
		//  res代表上传成功后返回的响应数据
		//  file代表上传成功后返回的图片文件本身(里面也包含res)
		handleAvatarSuccess(res, file) {
			// 默认带的,
			// this.imageUrl = URL.createObjectURL(file.raw);

			this.tmForm.logoUrl = res.data; //file.response.data
		},
		// 图片上传前的回调
		// 上传的时候限制图片的格式和大小
		beforeAvatarUpload(file) {
			// file代表上传的哪个图片
			const isJPG = file.type === "image/jpeg";
			const isLt2M = file.size / 1024 / 1024 < 2;

			if (!isJPG) {
				this.$message.error("上传头像图片只能是 JPG 格式!");
			}
			if (!isLt2M) {
				this.$message.error("上传头像图片大小不能超过 2MB!");
			}
			return isJPG && isLt2M;
		},

		// 点击添加按钮弹出添加品牌的dialog框
		showAddDialog() {
			this.dialogFormVisible = true;
			// 把tmForm内数据清空 解决点击取消按钮再点击添加按钮,图片和名称依然显示存在的bug
			this.tmForm = {
				tmName: "",
				logoUrl: "",
			};
		},

		// 点击修改弹出修改品牌的dialog对话框
		// row 代表就是要修改的哪一行, 就是要修改的品牌对象
		// row是列表页当中展示的数据
		// bug: 对话框修改还没提交,列表中也跟着修改了.因为引用的是对象的地址
		showUpdateDialog(row) {
			this.dialogFormVisible = true;
			this.tmForm = { ...row };
		},

		// 点击确定按钮回调:发请求添加或修改品牌
		addOrUpdateTrademark() {
			// form表单的整体验证
			this.$refs.tmForm.validate(async (valid) => {
				if (valid) {
					// alert("submit!");
					// 1.获取参数
					let trademark = this.tmForm;
					// 2.整理参数 如果参数不符合请求的格式,需要整理

					// 3.发请求
					try {
						// 请求成功
						await this.$API.trademark.addOrUpdate(trademark);
						// 1.提示
						this.$message.success(
							`trademark.id?'修改品牌成功':'添加品牌成功'`
						);
						// 2.关闭dialog
						this.dialogFormVisible = false;
						// 3.重新发请求更新页面
						// 若添加成功,重新请求的是第一页数据
						// 若修改成功,重新请求这条数据所在页面的数据
						this.getTrademarkList(trademark.id ? this.page : 1);
					} catch (error) {
						// 请求失败 提示即可
						this.$message.error(
							`trademark.id?'修改品牌失败':'添加品牌失败'`
						);
					}
				} else {
					console.log("error submit!!");
					return false;
				}
			});
		},

		// 点击删除按钮回调
		deleteTrademark(row) {
			this.$confirm(`你确定要删除${row.tmName}吗`, "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning",
			})
				.then(async () => {
					// 处理点击确定按钮逻辑
					// 点击确定按钮后发请求删除
					try {
						await this.$API.trademark.delete(row.id);
						// 1.删除成功后提示
						this.$message.success("删除品牌成功"); //简单版,下面是复杂版
						//   this.$message({
						//   type: 'success',
						//   message: '删除成功!'
						// });
						// 2.重新发请求列表数据!!! 正常:删除哪个数据回到的还是那个数据所在的页面;假设这个页面只有1条数据,需要回到前一页,而不是数据当前页
						this.getTrademarkList(
							this.trademarkList.length > 1
								? this.page
								: this.page - 1
						);
					} catch (error) {
						this.$message.error("删除品牌失败");
					}
				})
				.catch(() => {
					// 处理点击取消按钮逻辑
					this.$message({
						type: "info",
						message: "已取消删除",
					});
				});
		},

		// 点击弹出框取消按钮的回调 
		cancelUpload(formName){
			this.$refs[formName].resetFields();
			this.dialogFormVisible = false;
			
		},
	},
};
</script>

// <style lang="scss" scoped>
//
//
</style>
<style>
.avatar-uploader .el-upload {
	border: 1px dashed #d9d9d9;
	border-radius: 6px;
	cursor: pointer;
	position: relative;
	overflow: hidden;
}
.avatar-uploader .el-upload:hover {
	border-color: #409eff;
}
.avatar-uploader-icon {
	font-size: 28px;
	color: #8c939d;
	width: 178px;
	height: 178px;
	line-height: 178px;
	text-align: center;
}
.avatar {
	width: 178px;
	height: 178px;
	display: block;
}
</style>
