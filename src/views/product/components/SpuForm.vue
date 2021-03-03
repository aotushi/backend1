<template>
	<div>
		<el-form :model="spuForm">
			<el-form-item label="SPU名称" label-width="100px">
				<el-input
					placeholder="SPU名称"
					v-model="spuForm.spuName"
				></el-input>
			</el-form-item>

			<el-form-item label="品牌" label-width="100px">
				<el-select
					v-model="spuForm.tmId"
					placeholder="请选择品牌"
					label-width="100px"
				>
					<el-option
						v-for="(tm, index) in trademarkList"
						:key="tm.id"
						:label="tm.tmName"
						:value="tm.id"
					></el-option>
				</el-select>
			</el-form-item>

			<!-- element-ui里面没有textarea 使用input去做 -->
			<el-form-item label="SPU描述" label-width="100px">
				<el-input
					placeholder="SPU描述"
					type="textarea"
					rows="4"
					v-model="spuForm.description"
				></el-input>
			</el-form-item>

			<el-form-item label="SPU图片" label-width="100px">
				<!-- file-list="fileList" 指定图片展示的是哪个数组 -->
				<el-upload
					action="/dev-api/admin/product/fileUpload"
					list-type="picture-card"
					:file-list="spuImageList"
					:on-preview="handlePictureCardPreview"
					:on-remove="handleRemove"
					:on-success="handleAvatarSuccess"
				>
					<i class="el-icon-plus"></i>
				</el-upload>

				<el-dialog :visible.sync="dialogVisible">
					<img width="100%" :src="dialogImageUrl" alt="" />
				</el-dialog>
			</el-form-item>

			<el-form-item label="销售属性" label-width="100px">
				<el-select
					v-model="unUseSaleAttrIdName"
					:placeholder="
						unUseSaleAttrList.length > 0
							? `还有${unUseSaleAttrList.length}项未选择`
							: '数量为0'
					"
				>
					<!-- 使用模板字符串收集数据??? -->
					<el-option
						:label="unUseSaleAttr.name"
						:value="`${unUseSaleAttr.id}:${unUseSaleAttr.name}`"
						v-for="(unUseSaleAttr, index) in unUseSaleAttrList"
						:key="unUseSaleAttr.id"
					></el-option>
				</el-select>
				<el-button
					type="primary"
					icon="el-icon-plus"
					@click="addSaleAttr"
					:disabled="!unUseSaleAttrIdName"
					>添加销售属性</el-button
				>

				<el-table
					border
					style="width: 100%"
					:data="spuForm.spuSaleAttrList"
				>
					<el-table-column
						align="center"
						type="index"
						label="序号"
						width="80"
					>
					</el-table-column>

					<el-table-column
						prop="saleAttrName"
						label="属性名"
						width="150"
					>
					</el-table-column>

					<el-table-column
						prop="prop"
						label="属性值名称列表"
						width="width"
					>
						<template slot-scope="{ row, $index }">
							<!-- 
                closable 是否显示叉号
                :disable-transition 是否禁用过渡
                @close="handleClose(tag)" 点击叉号的回调  
               -->
							<el-tag
								closable
								:disable-transitions="false"
								v-for="(
									saleAttrValue, index
								) in row.spuSaleAttrValueList"
								:key="saleAttrValue.id"
								@close="
									row.spuSaleAttrValueList.splice(index, 1)
								"
							>
								{{ saleAttrValue.saleAttrValueName }}
							</el-tag>
							<!-- 
                @keyup.enter.native="handleInputConfirm"
								@blur="handleInputConfirm"
               -->
							<el-input
								class="input-new-tag"
								v-if="row.inputVisible"
								v-model="row.inputValue"
								ref="saveTagInput"
								size="small"
								@keyup.enter.native="handleInputConfirm(row)"
								@blur="handleInputConfirm(row)"
							>
							</el-input>
							<!-- 	
                @click="showInput"
               -->
							<el-button
								v-else
								class="button-new-tag"
								size="small"
								@click="showInput(row)"
								>添加</el-button
							>
						</template>
					</el-table-column>

					<el-table-column prop="prop" label="操作" width="150">
						<template slot-scope="{ row, $index }">
							<HintButton
								type="danger"
								icon="el-icon-delete"
								size="mini"
								title="删除销售属性"
								@click="
									spuForm.spuSaleAttrList.splice($index, 1)
								"
							/>
						</template>
					</el-table-column>
				</el-table>
			</el-form-item>

			<el-form-item label-width="100px">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="cancel">取消</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
export default {
	name: "SpuForm",
	props: ["visible"],
	data() {
		// 和upload相关动态数据
		return {
			category3Id: "",
			dialogImageUrl: "",
			dialogVisible: false,

			spuForm: {
				category3Id: "",
				description: "",
				//id: "",
				spuImageList: [],
				spuName: "",
				spuSaleAttrList: [
					// baseSaleAttrId:1
					// id:7
					// saleAttrName:"颜色"
					// spuId:4
					// spuSaleAttrValueList:[]
				],
				tmId: "",
			}, //spu详情数据. 这个也是后面需要收集的对象,内部和修改请求回来的数据结构是一样的
			spuImageList: [], //请求初始化spu图片列表
			trademarkList: [], //请求初始化所有品牌列表
			saleAttrList: [], // /请求初始化所有销售属性列表

			unUseSaleAttrIdName: "", //收集未选择使用的
		};
	},
	methods: {
		// upload相关的回调函数
		handleRemove(file, fileList) {
			//删除图片时需要收集的图片列表
			//console.log(file, fileList);
			this.spuImageList = fileList;
		},
		// 预览大图方法, 不用动
		handlePictureCardPreview(file) {
			this.dialogImageUrl = file.url; //把需要放大的图片src赋值到对话框当中的图片
			this.dialogVisible = true; //弹出放大图片的对话框
		},

		// 图片上传成功的回调
		handleAvatarSuccess(res, file, fileList) {
			// 上传成功,收集图片列表
			console.log(fileList)
			this.spuImageList = fileList;
		},

		// 请求获取修改spu的初始化数据
		async getUpdateSpuFormInitData(row, category3Id) {
			this.category3Id = category3Id;
			// 发4个请求
			// getSpuById/id  根据spu的id获取spu的详情数据
			const result = await this.$API.spu.get(row.id);
			if (result.code === 200) {
				this.spuForm = result.data;
			}

			// product/spuImageList/id
			const imageResult = await this.$API.sku.getSpuImageList(row.id);
			if (imageResult.code === 200) {
				let spuImageList = imageResult.data;
				// 为了让upload展示图片列表,必须把请求回来的图片当中添加name和url属性
				spuImageList.forEach((item) => {
					item.name = item.imgName;
					item.url = item.imgUrl;
				});
				this.spuImageList = spuImageList;
			}

			// baseTrademark/getTrademarkList  品牌列表
			const trademarkResult = await this.$API.trademark.getList();
			if (trademarkResult.code === 200) {
				this.trademarkList = trademarkResult.data;
			}

			// product/baseSaleAttrList 销售属性列表
			const saleAttrResult = await this.$API.spu.getSaleAttrList();
			if (saleAttrResult.code === 200) {
				this.saleAttrList = saleAttrResult.data;
			}
		},

		// 请求获取添加spu的初始化数据
		async getAddSpuFormInitData(category3Id) {
			this.category3Id = category3Id;
			// 发2个请求
			// baseTrademark/getTrademarkList  品牌列表
			// product/baseSaleAttrList 销售属性列表

			const trademarkResult = await this.$API.trademark.getList();
			if (trademarkResult.code === 200) {
				this.trademarkList = trademarkResult.data;
			}

			// product/baseSaleAttrList 销售属性列表
			const saleAttrResult = await this.$API.spu.getSaleAttrList();
			if (saleAttrResult.code === 200) {
				this.saleAttrList = saleAttrResult.data;
			}
		},

		// 点击添加销售属性
		addSaleAttr() {
			let [baseSaleAttrId, saleAttrName] = this.unUseSaleAttrIdName.split(
				":"
			);
			let obj = {
				spuSaleAttrValueList: [],
				baseSaleAttrId,
				saleAttrName,
			};

			this.spuForm.spuSaleAttrList.push(obj);
			this.unUseSaleAttrIdName = ""; //清空收集的数据
		},

		// 点击销售属性值列表中的添加按钮
		showInput(row) {
			// row.inputvVisible = true;
			this.$set(row, "inputVisible", true);
			this.$set(row, "inputValue", "");
			// 自动获取焦点
			this.$nextTick(() => {
				this.$refs.saveTagInput.focus();
			});
		},

		// 当用户输入销售属性值完成后, 失去焦点或回车的回调
		handleInputConfirm(row) {
			console.log(row);
			let saleAttrValueName = row.inputValue;
			let baseSaleAttrId = row.id;
			// 拿到数据值名称判断是否是空串
			if (saleAttrValueName.trim() === "") return (row.inputValue = "");
			//判断当前销售属性值名称是否已经在销售属性值列表中存在,这里不需要除去自身. 因为我们现在还没有把销售属性值添加到指定的位置.之前平台属性要除去自身,因为之前平台属性用的是占位思想,还没有输入平台属性值名称,就已经添加到这个平台属性值,所以要除去自身. +++
			let isRepeat = row.spuSaleAttrValueList.some((item) => {
				return item.saleAttrValueName === saleAttrValueName;
			});

			if (isRepeat) {
				this.$message.info("不能重复");
				return (row.inputValue = "");
			}
			// 销售属性值名称没问题, 就构造需要的销售属性值对象
			let obj = {
				saleAttrValueName,
				baseSaleAttrId,
			};

			row.spuSaleAttrValueList.push(obj); //

			row.inputVisible = false;
			row.inputValue = ""; //清空input中的值
		},
		// 添加spuho修改spu的保存操作
		async save() {
			// 1.获取参数
			let { spuForm, spuImageList, category3Id } = this;
			// 2.整理参数
			// 2.1 整理3Id
			spuForm.category3Id = category3Id;
			// 2.2 整理图片列表. 结构
			// map
			spuImageList = spuImageList.map((item) => {
				return {
					imgName: item.name,
					imgUrl: item.imgUrl || item.response.data, //自己新上传的图片路径
				};
			});
			spuForm.spuImageList = spuImageList;
			// 2.3 整理销售属性
			spuForm.spuSaleAttrList.forEach((item) => {
				delete item.inputValue;
				delete item.inputVisible;
			});

			// 3.发请求
			try {
				console.log(spuForm)
				// 成功
				await this.$API.spu.addUpdate(spuForm);
				this.$message.success("保存spu成功");
				// 返回列表页
				this.$emit("update:visible", false);
				// 返回列表页后,在列表页发请求重新获取列表数据
				this.$emit('backSuccess')
				// 返回成功后把当前页面的spuForm数据清空
				this.resetData();
			} catch (error) {
				// 失败
				this.$message.error("保存spu失败");
			}
		},
		// 清空data中数据
		resetData() {
			this.dialogImageUrl = "";
			this.dialogVisible = false;
			this.category3Id = "";
			this.spuForm = {
				category3Id: "",
				description: "",
				spuImageList: [],
				spuName: "",
				spuSaleAttrList: [],
				tmId: "",
			};
			this.spuImageList = [];
			this.trademarkList = [];
			this.saleAttrList = [];

			this.unUseSaleAttrIdName = "";
		},

		// 点击取消
		cancel() {
			// 返回列表页
			this.$emit("update:visible", false);
			// 清空当前数据
			this.resetData();

			this.$emit("cancelSuccess");
		},
	},
	computed: {
		// 根据请求获取的所有的销售属性列表this.saleAttrList和spu详情当中自己的销售属性列表this.spuForm.spuSaleAttrList去计算得到未选择的销售属性列表
		unUseSaleAttrList() {
			return this.saleAttrList.filter((item) => {
				return this.spuForm.spuSaleAttrList.every((item2) => {
					return item2.saleAttrName !== item.name;
				});
			});
		},
	},
};
</script>

<style>
.el-tag + .el-tag {
	margin-left: 10px;
}
.button-new-tag {
	margin-left: 10px;
	height: 32px;
	line-height: 30px;
	padding-top: 0;
	padding-bottom: 0;
}
.input-new-tag {
	width: 90px;
	margin-left: 10px;
	vertical-align: bottom;
}
</style>