<template>
	<div>
		<el-form :model="skuForm">
			<el-form-item label="SPU名称" label-width="100px">
				{{ spu.spuName }}
			</el-form-item>

			<el-form-item label="SKU名称" label-width="100px">
				<el-input
					placeholder="SKU名称"
					v-model="skuForm.skuName"
				></el-input>
			</el-form-item>

			<el-form-item label="价格(元)" label-width="100px">
				<el-input placeholder="价格" v-model="skuForm.price"></el-input>
			</el-form-item>

			<el-form-item label="重量(千克)" label-width="100px">
				<el-input
					placeholder="重量(千克)"
					v-model="skuForm.weight"
				></el-input>
			</el-form-item>

			<el-form-item label="规格描述" label-width="100px">
				<el-input
					placeholder="规格描述"
					type="textarea"
					rows="4"
					v-model="skuForm.skuDesc"
				></el-input>
			</el-form-item>

			<el-form-item label="平台属性" label-width="100px">
				<el-form :inline="true">
					<el-form-item
						:label="attr.attrName"
						label-width="100px"
						v-for="(attr, index) in attrList"
						:key="attr.id"
					>
						<el-select
							v-model="attr.attrIdValueId"
							placeholder="请选择"
						>
							<el-option
								:label="attrValue.valueName"
								v-for="(attrValue, index) in attr.attrValueList"
								:key="attrValue.id"
								:value="`${attr.id}:${attrValue.id}`"
							>
							</el-option>
						</el-select>
					</el-form-item>
				</el-form>
			</el-form-item>

			<el-form-item label="销售属性" label-width="100px">
				<el-form :inline="true">
					<el-form-item
						:label="saleAttr.saleAttrName"
						label-width="100px"
						v-for="(saleAttr, index) in spuSaleAttrList"
						:key="saleAttr.id"
					>
						<el-select
							v-model="saleAttr.saleAttrIdValueId"
							placeholder="请选择"
						>
							<el-option
								:label="saleAttrValue.saleAttrValueName"
								v-for="(
									saleAttrValue, index
								) in saleAttr.spuSaleAttrValueList"
								:key="saleAttrValue.id"
								value="`${saleAttr.id}:${saleAttrValue.id}`"
							>
							</el-option>
						</el-select>
					</el-form-item>
				</el-form>
			</el-form-item>

			<el-form-item label="图片列表" label-width="100px">
				<el-table
					border
					:data="spuImageList"
					@selection-change="handleSelectionChange"
				>
					<el-table-column
						prop="prop"
						type="selection"
						width="55"
					></el-table-column>
					<el-table-column prop="prop" label="图片" width="width">
						<template slot-scope="{ row, $index }">
							<img
								:src="row.imgUrl"
								style="width: 80px; height: 80px"
							/>
						</template>
					</el-table-column>
					<el-table-column prop="prop" label="图片名称" width="width">
						<template slot-scope="{ row, $index }">
							{{ row.imgName }}
						</template>
					</el-table-column>
					<el-table-column prop="prop" label="操作" width="width">
						<template slot-scope="{ row, $index }">
							<el-button
								type="primary"
								size="mini"
								@click="setDefaultImg(row, spuImageList)"
								v-if="row.isDefault === '0'"
								>设为默认</el-button
							>
							<el-tag v-else type="success">默认</el-tag>
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
	name: "SkuForm",
	data() {
		return {
			spu: {},
			attrList: [],
			spuSaleAttrList: [],
			spuImageList: [],

			skuImageList: [],

			skuForm: {
				// 以下3个从父组件传递过来
				spuId: "",
				category3Id: "",
				tmId: "",
				// 通过v-model收集
				skuName: "",
				price: "",
				weight: "",
				skuDesc: "",
				// 通过自己收集
				skuAttrValueList: [], //平台属性值
				skuDefaultImg: "", //默认图片路径
				skuImageList: [],
				skuSaleAttrValueList: [],
			},
		};
	},
	methods: {
		async getAddSkuFormInitData(row, category1Id, category2Id) {
			this.spu = row;
			// 根据123级分类获取平台属性列表
			// admin/product/attrInfoList/2/13/61
			const promise1 = this.$API.attr.getList(
				category1Id,
				category2Id,
				row.category3Id
			);

			// 根据spu的id获取spu销售属性列表
			const promise2 = this.$API.sku.getSpuSaleAttrList(row.id);

			// 根据spu的id获取图片列表
			const promise3 = this.$API.sku.getSpuImageList(row.id);

			const result = await Promise.all([promise1, promise2, promise3]);

			this.attrList = result[0].data;
			this.spuSaleAttrList = result[1].data;
			let spuImageList = result[2].data;
			// 在这里添加好属性, 后面直接把数组赋值给响应式属性this.spuImageList.所以内部的东西也是响应式属性
			spuImageList.forEach((item) => {
				item.isDefault = "0";
			});
			this.spuImageList = spuImageList;
		},

		// 收集图片列表
		handleSelectionChange(val) {
			this.skuImageList = val;
		},

		// 点击按钮, 设置默认图片
		setDefaultImg(row, spuImageList) {
			spuImageList.forEach((item) => (item.isDefault = "0"));
			row.isDefault = "1";
			this.skuForm.skuDefaultImg = row.imgUrl;
		},

		// 添加sku保存操作
		async save() {
			// 获取参数
			let {
				spu,
				skuForm,
				attrList,
				spuSaleAttrList,
				skuImageList,
			} = this;
			// 整理参数
			// 整理父组件传递过来的数据
			skuForm.skuId = spu.id;
			skuForm.category3Id = spu.category3Id;
			skuForm.tmId = spu.tmId;
			// 整理图片列表
			skuForm.skuImageList = skuImageList.map((item) => {
				return {
					imgName: item.imgName,
					imgUrl: item.imgUrl,
					isDefault: item.isDefault,
					spuImgId: item.id,
				};
			});
			// 整理spu平台属性值列表和销售属性值列表
			skuForm.skuAttrValueList = attrList.reduce((prev, item) => {
				if (item.attrIdValueId) {
					// 判断哪个平台属性当年被选择过属性值
					let [attrId, valueId] = item.attrIdValueId.splice(":");
					let obj = {
						attrId,
						valueId,
					};
					prev.push(obj);
				}
				return prev;
			}, []);

			skuForm.skuSaleAttrValueList = spuSaleAttrList.reduce(
				(prev, item) => {
					if (item.saleAttrIdValueId) {
						let [
							saleAttrId,
							saleAttrValueId,
						] = item.saleAttrIdValueId.split(":");
						let obj = { saleAttrId, saleAttrValueId };
						prev.push(obj);
					}
				},
				[]
			);

			// 发请求
			try {
				console.log(skuForm);
				await this.$API.sku.addUpdate(skuForm);

				// 提示
				this.$message.success("保存sku成功");
				// 返回spu列表页面,不需要重新获取spu列表数据
				this.$emit("update:visible", false);
				// 清空skuForm相关data数据
				this.resetData();
			} catch (error) {
				this.$message.error("保存sku失败");
			}
		},

		// 清空data数据
		resetData() {
			(this.spu = {}),
				(this.attrList = []),
				(this.spuSaleAttrList = []),
				(this.spuImageList = []),
				(this.skuImageList = []),
				(this.skuForm = {
					// 以下3个从父组件传递过来
					spuId: "",
					category3Id: "",
					tmId: "",
					// 通过v-model收集
					skuName: "",
					price: "",
					weight: "",
					skuDesc: "",
					// 通过自己收集
					skuAttrValueList: [], //平台属性值
					skuDefaultImg: "", //默认图片路径
					skuImageList: [],
					skuSaleAttrValueList: [],
				});
		},

		// 清空sku的取消操作
		cancel() {
			this.$emit("update:visible", false);
			this.resetData();
		},
	},
};
</script>

<style>
</style>