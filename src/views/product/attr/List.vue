<template>
	<div>
		<el-card>
			<!-- 
        三级联动组件
       -->
			<CategorySelector
				@handlerCategory="handlerCategory"
        :isShowList="isShowList"
			></CategorySelector>
		</el-card>

		<el-card style="margin-top: 20px">
			<!-- 属性列表页 -->
			<div v-show="isShowList">
				<!-- 属性列表 -->
				<el-button
					type="primary"
					icon="el-icon-plus"
					@click="showAddDiv"
					:disabled="!category3Id"
					>添加属性</el-button
				>
				<el-table border style="width: 100%" :data="attrList">
					<el-table-column
						label="序号"
						type="index"
						width="80"
						aling="center"
					></el-table-column>
					<el-table-column
						label="属性名称"
						width="150"
						prop="attrName"
					></el-table-column>
					<el-table-column label="属性值列表" width="width">
						<!-- 
            展示属性值列表时需要遍历,而且每个属性值外部有结构,所以需要使用作用域插槽
           -->
						<template slot-scope="{ row, $index }">
							<!-- 
              row代表当前遍历的属性
              row.attrValueList才是要自己遍历展示的属性值列表
             -->
							<el-tag
								closable
								type="success"
								v-for="(attrValue, index) in row.attrValueList"
								:key="attrValue.id"
								>{{ attrValue.valueName }}</el-tag
							>
						</template>
					</el-table-column>

					<el-table-column label="操作" width="150">
						<template slot-scope="{ row, $index }">
							<HintButton
								type="warning"
								icon="el-icon-edit"
								title="修改"
								size="mini"
								@click="showUpdateDiv(row)"
							></HintButton>
							<el-popconfirm :title="`你确定要删除${row.attrName}吗`" @onConfirm="deleteAttr(row)">
								<HintButton
									slot="reference"
									type="danger"
									icon="el-icon-delete"
									title="删除"
									size="mini"
								></HintButton>
							</el-popconfirm>
						</template>
					</el-table-column>
				</el-table>
			</div>

			<!-- 添加或修改页面 -->
			<div v-show="!isShowList">
				<el-form :inline="true" width="80px" :model="attrForm">
					<el-form-item label="属性名">
						<el-input
							placeholder="请输入属性名"
							v-model="attrForm.attrName"
						></el-input>
					</el-form-item>
				</el-form>

				<el-button
					type="primary"
					icon="el-icon-plus"
					@click="addAttrValue"
					:disabled="!attrForm.attrName"
					>添加属性值</el-button
				>
				<el-button @click="isShowList = true">取消</el-button>

				<!-- table是收集属性值列表 -->
				<!-- 
          如何收集?
          先使用table去展示要收集的属性值列表.但开始的时候属性值列表时空的,所以table中不会显示任何东西.
          当要收集属性值时,用了占位思想,向数组里添加了一个属性值对象.只不过属性值名称此时是空的.但是一旦添加这个属性值对象,表格当中都会出现一行.可以使用输入框再去给刚才添加的属性值对象收集名称
         -->
				<el-table
					:data="attrForm.attrValueList"
					border
					style="width: 100%; margin: 20px 0"
				>
					<el-table-column
						type="index"
						prop="prop"
						label="序号"
						align="center"
						width="80"
					>
					</el-table-column>

					<el-table-column
						prop="prop"
						label="属性值名称"
						width="width"
					>
						<template slot-scope="{ row, $index }">
							<el-input
								:ref="$index"
								v-if="row.isEdit"
								v-model="row.valueName"
								placeholder="请输入属性值名称"
								@blur="toLook(row)"
								@keyup.enter.native="toLook(row)"
								size="mini"
							></el-input>
							<span
								v-else
								@click="toEdit(row, $index)"
								style="display: block; width: 100%"
								>{{ row.valueName }}</span
							>
						</template>
					</el-table-column>

					<el-table-column prop="prop" label="操作" width="width">
						<template slot-scope="{ row, $index }">
							<el-popconfirm
								:title="`你确定删除${row.valueName}`"
								@onConfirm="
									attrForm.attrValueList.splice($index, 1)
								"
							>
								<!-- onConfirm点击气泡确认框的确定按钮,会触发一个事件. 官网事件名称写错了 -->
								<HintButton
									slot="reference"
									type="danger"
									icon="el-icon-delete"
									title="删除属性值"
									size="mini"
								></HintButton>
							</el-popconfirm>
						</template>
					</el-table-column>
				</el-table>

				<el-button type="primary" @click="save" :disabled="attrForm.attrValueList.length===0">保存</el-button>
				<el-button @click="isShowList = true">取消</el-button>
			</div>
		</el-card>
	</div>
</template>

<script>
import deelClone from "lodash/cloneDeep";
export default {
	name: "Attr",
	data() {
		return {
			category1Id: "",
			category2Id: "",
			category3Id: "",
			attrList: [],
			isShowList: true,
			attrForm: {
				attrName: "",
				attrValueList: [
					// {
					//   "attrId": 0,
					//   "id": 0,
					//   "valueName": "string"
					// }
				],
				categoryId: 0, //不能使用this.category3Id, data中不能使用this,data是一个对象,对象是无序的,初始化时谁先谁后不一定.
				categoryLevel: 3,
			},
		};
	},
	methods: {
		handlerCategory({ categoryId, level }) {
			if (level === 1) {
				this.category1Id = categoryId;

				// 子组件重新选择1级,清空父组件当中的23级和属性列表
				this.category2Id = "";
				this.category3Id = "";
				this.attrList = [];
			} else if (level === 2) {
				this.category2Id = categoryId;
				// 子组件重新选择2级,清空父组件当中的3级和属性列表
				this.category3Id = "";
				this.attrList = [];
			} else if (level === 3) {
				this.category3Id = categoryId;
				// 发请求拿平台属性的数据 而非在categorySelector组件中请求
				this.getAttrList();
			}
		},
		// 请求获取属性的列表数据
		async getAttrList() {
			let { category1Id, category2Id, category3Id } = this;
			const result = await this.$API.attr.getList(
				category1Id,
				category2Id,
				category3Id
			);
			if (result.code === 200) {
				this.attrList = result.data;
				console.log(this.attrList);
			}
		},
		// 点击添加按钮显示添加的页面回调
		showAddDiv() {
			this.isShowList = false;
			// 每次打开添加属性值的页面都得把收集的数据重置
			// 在这里可以顺便收集categoryId

			// 解决添加属性值按钮还显示上次数据的bug attrForm空值
			this.attrForm = {
				attrName: "",
				attrValueList: [
					// {
					//   "attrId": 0,
					//   "id": 0,
					//   "valueName": "string"
					// }
				],
				categoryId: this.category3Id,
				categoryLevel: 3,
			};
		},
		// 点击添加属性值
		addAttrValue() {
			this.attrForm.attrValueList.push({
				attrId: this.attrForm.id, //代表属性值所属属性的id. 有id就是修改页面,没有id就是增加页面undefined
				// id:'', 新添加属性值没有id,
				valueName: "", //一会需要用户输入的属性值名称
				isEdit: true, //这个属性值标识这个属性值模式是编辑模式
			});

			// 让新添加的属性值自动获取焦点
			// 新添加的永远是最后一个
			this.$nextTick(() => {
				this.$refs[this.attrForm.attrValueList.length - 1].focus();
			});
		},

		// 点击修改属性值按钮显示修改属性值页面
		showUpdateDiv(row) {
			this.isShowList = false;
			// this. attrForm = row; 复杂数据结构需要使用深拷贝
			this.attrForm = deelClone(row);
			// 这里代表修改属性, 因为属性当中已经存在一些属性值,这些属性值也是 添加模式. 但下面的写法是错误的,不是响应式属性
			// this.attrForm.attrValueList.forEach(item=>item.isEdit=false);
			// 为响应式对象添加新属性才是响应式属性
			this.attrForm.attrValueList.forEach((item) =>
				this.$set(item, "isEdit", false)
			);
		},

		// 对input失去焦点或者回车,切换为查看模式
		toLook(row) {
			// 1.失去焦点时,需要判断数据中是否有属性值名称: 如果没有值或者值不合法,不会变为span
			if (row.valueName.trim() === "") return (row.valueName = "");
			// 2.判断当前输入的属性值名称再除去自身以外,其余属性值是否存在.如果存在是重复,不能变为span
			let isRepeat = this.attrForm.attrValueList.some((item) => {
				if (item !== row) {
					return item.valueName === row.valueName;
				}
			});

			if (isRepeat) {
				this.$message.info("输入的属性值名称不能重复");
				row.valueName = "";
				return;
			}

			row.isEdit = false;
		},
		// 对span点击, 切换为编辑模式
		toEdit(row, index) {
			row.isEdit = true;

			// 从span变为input,需要自动获取焦点
			// 直接写这一行,input标签其实还没有创建成功会报错this.$refs[index]是undefined
			this.$nextTick(() => {
				// nextTick等待页面更新后才自动调用
				this.$refs[index].focus();
			});
		},

		// 保存操作
		async save() {
			// 1.获取参数
			this.attr = this.attrForm;
			// 2.整理参数
			// 2.1 如果属性值名称如果为空串,从属性值列表中去掉
			// 2.2 属性值当中去除isEdit属性.(isEdit是我们自己添加的,用来标识查看和编辑模式的)
			attr.attrValueList = attr.attrValueList.filter((item) => {
				if (item.valueName !== "") {
					delete item.isEdit;
					return true;
				}
			});
			// 2.3 属性值列表如果没有属性值, 不发请求
			if (attr.attrValueList.length === 0)
				return this.$message.info("属性值列表必须有属性值才能保存");

			// 3.发请求
			try {
				// 4.成功干嘛
				await this.$API.attr.addOrUpdate(attr);
				// 4.1 成功提示
				this.$message.success("保存属性成功");
				this.isShowList = true;
				this.getAttrList();
			} catch (error) {
				// 5.失败干嘛
				this.$message.error("保存属性失败" + error.message);
			}
		},

    // 删除属性操作
    async deleteAttr(row) {
      try {
        await this.$API.attr.delete(row.id);
        this.$message.success('删除属性成功');
        this.getAttrList();
      } catch (error) {
        this.$message.error('删除属性失败'+error.message);
      }
    }
	},
};
</script>

<style lang="scss" scoped>
</style>