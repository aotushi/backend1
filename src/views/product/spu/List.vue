<template>
	<div>
		<el-card>
			<CategorySelector
				@handlerCategory="handlerCategory"
				:isShowList="isShowList"
			></CategorySelector>
		</el-card>

		<el-card style="margin-top: 20px">
			<!-- 对应spu的列表页 -->
			<div v-show="!isShowSpuForm && !isShowSkuForm">
				<el-button
					type="primary"
					icon="el-icon-plus"
					:disabled="!category3Id"
					@click="showAddSpuForm"
					>添加SPU</el-button
				>
				<el-table :data="spuList" border style="width: 100%">
					<el-table-column
						type="index"
						align="center"
						label="序号"
						width="80"
					>
					</el-table-column>

					<el-table-column
						prop="spuName"
						label="SPU名称"
						width="width"
					>
					</el-table-column>

					<el-table-column
						prop="description"
						label="SPU描述"
						width="width"
					>
					</el-table-column>

					<el-table-column prop="prop" label="操作" width="width">
						<template slot-scope="{ row, $index }">
							<HintButton
								type="success"
								icon="el-icon-plus"
								size="mini"
								title="添加SKU"
								@click="showAddSkuForm(row)"
							></HintButton>
							<HintButton
								type="warning"
								icon="el-icon-edit"
								size="mini"
								title="修改SPU"
								@click="showUpdateSpuForm(row)"
							></HintButton>
							<HintButton
								type="info"
								icon="el-icon-info"
								size="mini"
								title="查看SPU的SKU列表"
								@click="showSkuList(row)"
							></HintButton>
							<el-popconfirm
								:title="`你确定删除${row.spuName}`"
								@onConfirm="deleteSpu(row)"
							>
								<HintButton
									slot="reference"
									type="danger"
									icon="el-icon-delete"
									size="mini"
									title="删除SPU"
								></HintButton>
							</el-popconfirm>
						</template>
					</el-table-column>
				</el-table>

				<!-- 
           @size-change="handleSizeChange"
          @current-change="handlerCurrentChange"
         -->
				<el-pagination
					@current-change="getSpuList"
					@size-change="handleSizeChange"
					style="text-align: center"
					:current-page="page"
					:page-sizes="[2, 4, 6]"
					:page-size="limit"
					:pager-count="5"
					layout=" prev, pager, next, jumper,->,sizes, total"
					:total="total"
				>
				</el-pagination>
			</div>

			<!-- 
          对应spu的添加修改页面 
          使用组件代替两个div,降低页面的复杂度
        -->
			<!-- <div></div> -->
			<!-- <SpuForm v-show="isShowSpuForm" :visible="isShowSpuForm" @update:visible='isShowSpuForm=$event'></SpuForm> -->
			<SpuForm
				v-show="isShowSpuForm"
				:visible.sync="isShowSpuForm"
				ref="spu"
				@backSuccess="backSuccess"
				@cancelSuccess="cancelSuccess"
			></SpuForm>

			<!-- 对应sku添加页面 -->
			<!-- <div></div> -->
			<SkuForm
				v-show="isShowSkuForm"
				:visible.sync="isShowSkuForm"
				ref="sku"
			></SkuForm>
		</el-card>

		<el-dialog :visible.sync="dialogVisible" width="width" :title="spu.spuName" :before-close="handlerClose">
			<el-table
			v-loading="loading"
				:data="skuList"
				style="width: 100%">
				<el-table-column
					prop="skuName"
					label="名称"
					width="width">
				</el-table-column>

				<el-table-column
					prop="price"
					label="价格"
					width="width">
				</el-table-column>

				<el-table-column
					prop="weight"
					label="重量"
					width="width">
				</el-table-column>

				<el-table-column
					prop="prop"
					label="默认图片"
					width="width">
					<template slot-scope="{row,$index}">
						<img :src="row.skuDefaultImg" style="width:100px;height:100px" />
					</template>
				</el-table-column>
			</el-table>
		</el-dialog>
	</div>
</template>

<script>
import SkuForm from "@/views/product/components/SkuForm";
import SpuForm from "@/views/product/components/SpuForm";
export default {
	name: "Spu",
	components: {
		SkuForm,
		SpuForm,
	},
	data() {
		return {
			category1Id: "",
			category2Id: "",
			category3Id: "",
			spuList: [],
			isShowList: true, //完成三级分类的可操作性
			// 有分页就得有这3个数据
			page: 1,
			limit: 2,
			total: 0,
			// 添加2个数据,为3个页面显示隐藏添加条件
			isShowSpuForm: false,
			isShowSkuForm: false,

			dialogVisible: false,
			spu:{},
			skuList:[],
			loading: true
		};
	},
	// watch:{
	// 	isShowSpuForm:{
	// 		handler(newVal,oldVal) {
	// 			this.isShowList = !newVal;
	// 		}
	// 	},
	// 	isShowSkuForm(newVal,oldVal){
	// 		this.isShowList = !newVal;
	// 	}
	// },
	methods: {
		handlerCategory({ categoryId, level }) {
			if (level === 1) {
				this.category1Id = categoryId;

				this.category2Id = "";
				this.category3Id = "";
				this.spuList = [];
			} else if (level === 2) {
				this.category2Id = categoryId;

				this.category3Id = "";
				this.spuList = [];
			} else if (level === 3) {
				this.category3Id = categoryId;
				this.getSpuList();
			}
		},
		// 获取spu分页列表
		async getSpuList(pager = 1) {
			this.page = pager;
			const result = await this.$API.spu.getList(
				this.page,
				this.limit,
				this.category3Id
			);
			if (result.code === 200) {
				this.spuList = result.data.records;
				this.total = result.data.total;
			}
		},

		handleSizeChange(size) {
			this.limit = size;
			this.getSpuList();
		},

		// 点击添加spu的回调
		showAddSpuForm() {
			this.isShowList = false;
			this.isShowSpuForm = true;
			// 通过refs可以拿到子组件对象  (组件高级通信中的), 调用里方法,发请求
			this.$refs.spu.getAddSpuFormInitData(this.category3Id);
		},

		// 点击修改spu的回调
		showUpdateSpuForm(row) {
			this.flag = row.id; //让了返回的时候判断怎么返回的
			this.isShowSpuForm = true;

			this.$refs.spu.getUpdateSpuFormInitData(row, this.category3Id);
		},

		// 点击添加sku的回调
		showAddSkuForm(row) {
			this.isShowSkuForm = true;

			this.$refs.sku.getAddSkuFormInitData(
				row,
				this.category1Id,
				this.category2Id
			);
		},

		// 保存spu成功的返回
		backSuccess() {
			// 重新发请求获取列表数据
			// 添加成功的返回还是修改成功的返回
			if (this.flag) {
				// 修改回来的
				this.getSpuList(this.page);
			} else {
				// 添加回来的
				this.getSpuList();
			}

			this.flag = null; //重置标志位
		},

		// 取消返回的返回
		cancelSuccess() {
			this.flag = null; //重置标志位
		},

		// 删除spu
		async deleteSpu(row) {
			try {
				await this.$API.spu.remove(row.id);
				this.getSpuList(
					this.spuList.length > 1 ? this.page : this.page - 1
				);
			} catch (error) {
				this.$message.error("失败");
			}
		},

		// 查看sku的列表信息
		async showSkuList(row) {
			// 弹出对话框
			this.dialogVisible = true;
			// 保存spu  用它的名称
			this.spu = row;
			// 请求获取当前这个spu的sku列表,保存
			this.loading = true;
			const result = await this.$API.sku.getListBySpuId(row.id);
			if(result.code === 200) {
				this.skuList = result.data;
			}
			this.loading = false;
		},
		// dialog关闭前置所作的处理. 在这个函数当中需要手动关闭dialog
		handlerClose(done) {
			this.skuList = [];
			this.dialogVisible = false;
			this.loading = true;
		}
	},
};
</script>

<style lang="scss" scoped>
</style>