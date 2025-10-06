<template>
    <div>
        <transition :enter-active-class="proxy?.animate.searchAnimate.enter"
            :leave-active-class="proxy?.animate.searchAnimate.leave">
            <div class="mb-[10px]">
                <el-card shadow="hover">
                    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
                        <el-form-item label="用户名" prop="userName">
                            <el-input v-model="queryParams.userName" placeholder="用户名" clearable
                                @keyup.enter="handleQuery" />
                        </el-form-item>
                        <el-form-item label="昵称" prop="nickName">
                            <el-input v-model="queryParams.nickName" placeholder="用户昵称" clearable
                                @keyup.enter="handleQuery" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                        </el-form-item>
                    </el-form>
                </el-card>
            </div>
        </transition>
        <el-card shadow="never">
            <template #header>
                <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5">
                        <el-button type="primary" plain icon="Plus" @click="handleAdd"
                            v-hasPermi="['im:company:bind']">添加</el-button>
                    </el-col>
                    <el-col :span="1.5">
                        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleBatchRemove"
                            v-hasPermi="['im:company:bind']">移除</el-button>
                    </el-col>
                </el-row>
            </template>
            <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column label="用户名" align="center" prop="userName" />
                <el-table-column label="头像" align="center" prop="headImageThumb" width="100">
                    <template #default="scope">
                        <image-preview v-if="scope.row.headImageThumb" :src="scope.row.headImageThumb"
                            :full-src="scope.row.headImage" :width="50" :height="50" />
                    </template>
                </el-table-column>
                <el-table-column label="昵称" align="center" prop="nickName" />
                <el-table-column label="标签" align="center">
                    <template #default="scope">
                        <el-tag v-if="scope.row.status == 1" class="tag" type="danger">已注销</el-tag>
                        <el-tag v-if="scope.row.isBanned" class="tag" type="danger">已封禁</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                    <template #default="scope">
                        <el-button link type="danger" v-hasPermi="['im:company:bind']"
                            @click="handleRemove(scope.row)">移除</el-button>
                    </template>
                </el-table-column>

            </el-table>
            <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize" @pagination="getList" />
        </el-card>
        <!-- 添加员工对话框 -->
        <add-employee-dialog v-model="dialogVisible" ref="addEmployeeRef"
            @refreshDataList="getList"></add-employee-dialog>

    </div>
</template>

<script setup name="employee" lang="ts">
import { UserQuery, UserVO } from '@/api/im/user/types';
import { listUser } from '@/api/im/user';
import addEmployeeDialog from './addEmployeeDialog.vue';
import { CompanyVO, CompanyBindDTO } from '@/api/im/company/types';
import { unbindEmployee } from '@/api/im/company';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const queryParams = ref<UserQuery>({
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    nickName: undefined,
    lastLoginIp: undefined,
    companyId: undefined,
    params: {
    }
})

const userList = ref<UserVO[]>([]);
const loading = ref(true);
const total = ref(0);
const multiple = ref(true);
const ids = ref<Array<string | number>>([]);
const queryFormRef = ref<ElFormInstance>();
const dialogVisible = ref(false);
const addEmployeeRef = ref<ElFormInstance>();
const company = ref<CompanyVO>();

const handleQuery = () => {
    queryParams.value.pageNum = 1;
    getList();
}

/** 查询员工用户列表 */
const getList = async () => {
    loading.value = true;
    const res = await listUser(queryParams.value);
    userList.value = res.rows;
    total.value = res.total;
    loading.value = false;
}

const handleAdd = () => {
    dialogVisible.value = true;
    nextTick(() => addEmployeeRef.value.init(company.value));
}

const handleBatchRemove = async () => {
    await proxy?.$modal.confirm(`已选择${ids.value.length}位成员，是否确认移除？`);
    const data: CompanyBindDTO = {
        id: company.value.id,
        userIds: ids.value
    }
    unbindEmployee(data).then(() => {
        handleQuery();
        ElMessage.success('移除成功');
    })
}

const handleRemove = async (user: UserVO) => {
    await proxy?.$modal.confirm(`确认移除'${user.userName}'？`)
    const data: CompanyBindDTO = {
        id: company.value.id,
        userIds: [user.id]
    }
    unbindEmployee(data).then(() => {
        handleQuery();
        ElMessage.success('移除成功');
    })
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: UserVO[]) => {
    ids.value = selection.map(item => item.id);
    multiple.value = !selection.length;
}


const init = (companyInfo: CompanyVO) => {
    queryParams.value.companyId = companyInfo.id;
    company.value = companyInfo;
    getList();
}



defineExpose({
    init
})
</script>


<style lang="scss" scoped></style>