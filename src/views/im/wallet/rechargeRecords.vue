<template>
  <div class="p-2">
    <!-- 搜索栏 -->
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="queryParams.userName" placeholder="请输入用户名或昵称" clearable @keyup.enter="handleQuery" style="width: 200px" />
            </el-form-item>

            <el-form-item label="充值时间">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 240px"
              />
            </el-form-item>

            <el-form-item label="金额范围">
              <el-input-number
                v-model="queryParams.minAmount"
                placeholder="最小金额"
                :min="0"
                :precision="2"
                :controls="false"
                style="width: 120px"
              />
              <span style="margin: 0 5px">-</span>
              <el-input-number
                v-model="queryParams.maxAmount"
                placeholder="最大金额"
                :min="0"
                :precision="2"
                :controls="false"
                style="width: 120px"
              />
            </el-form-item>

            <el-form-item label="支付渠道" prop="channel">
              <el-select v-model="queryParams.channel" placeholder="请选择" clearable style="width: 150px">
                <el-option label="后台充值" value="ADMIN" />
                <el-option label="支付宝" value="ALIPAY" />
                <el-option label="微信支付" value="WECHAT" />
                <el-option label="银行转账" value="BANK" />
              </el-select>
            </el-form-item>

            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 120px">
                <el-option label="待支付" :value="0" />
                <el-option label="已完成" :value="1" />
                <el-option label="已取消" :value="2" />
                <el-option label="已退款" :value="3" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-header-text">充值记录列表</span>
          <div>
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['im:wallet:export']"> 导出 </el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="recordList" border>
        <el-table-column label="订单号" align="center" prop="orderNo" width="200" show-overflow-tooltip />

        <el-table-column label="用户信息" align="center" width="150">
          <template #default="scope">
            <div class="user-info">
              <div class="nick-name">{{ scope.row.nickName }}</div>
              <div class="user-name">{{ scope.row.userName }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="充值金额" align="center" prop="amount" width="140">
          <template #default="scope">
            <div class="amount-info">
              <span class="amount-value">+{{ scope.row.amount }}</span>
              <div class="currency">{{ scope.row.currency }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="充值前余额" align="center" prop="beforeBalance" width="120" />
        <el-table-column label="充值后余额" align="center" prop="afterBalance" width="120" />

        <el-table-column label="渠道" align="center" prop="channelName" width="100">
          <template #default="scope">
            <el-tag :type="getChannelType(scope.row.channel)" size="small">
              {{ scope.row.channelName }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="状态" align="center" prop="statusName" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ scope.row.statusName }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="备注" align="center" prop="remark" min-width="150" show-overflow-tooltip />

        <el-table-column label="完成时间" align="center" prop="completedTime" width="160">
          <template #default="scope">
            <span>{{ scope.row.completedTime || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" align="center" prop="createdAt" width="160">
          <template #default="scope">
            <span>{{ scope.row.createdAt }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { getRechargeRecords } from '@/api/im/wallet';
import type { RechargeRecordQuery, AdminRechargeRecordVO } from '@/api/im/wallet/types';

defineOptions({
  name: 'RechargeRecords'
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 加载状态
const loading = ref(false);
const showSearch = ref(true);

// 数据列表
const recordList = ref<AdminRechargeRecordVO[]>([]);
const total = ref(0);

// 日期范围
const dateRange = ref<[string, string] | null>(null);

// 查询参数
const queryParams = reactive<RechargeRecordQuery>({
  pageNum: 1,
  pageSize: 10,
  userId: undefined,
  userName: '',
  startTime: '',
  endTime: '',
  minAmount: undefined,
  maxAmount: undefined,
  channel: '',
  status: undefined
});

const queryFormRef = ref();

// 查询列表
const getList = async () => {
  loading.value = true;
  try {
    // 处理日期范围
    if (dateRange.value && dateRange.value.length === 2) {
      queryParams.startTime = dateRange.value[0];
      queryParams.endTime = dateRange.value[1];
    } else {
      queryParams.startTime = '';
      queryParams.endTime = '';
    }

    const res = await getRechargeRecords(queryParams);
    recordList.value = res.rows;
    total.value = res.total;
  } catch (error) {
    console.error('获取充值记录失败', error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// 重置
const resetQuery = () => {
  dateRange.value = null;
  queryFormRef.value?.resetFields();
  handleQuery();
};

// 获取状态标签类型
const getStatusType = (status: number) => {
  const types: Record<number, any> = {
    0: 'warning', // 待支付
    1: 'success', // 已完成
    2: 'info', // 已取消
    3: 'danger' // 已退款
  };
  return types[status] || 'info';
};

// 获取渠道标签类型
const getChannelType = (channel: string) => {
  const types: Record<string, any> = {
    'ADMIN': 'primary',
    'ALIPAY': 'success',
    'WECHAT': 'success',
    'BANK': 'warning'
  };
  return types[channel] || 'info';
};

// 导出
const handleExport = () => {
  proxy?.download(
    '/im/admin/wallet/recharge-records/export',
    {
      ...queryParams
    },
    `recharge_records_${new Date().getTime()}.xlsx`
  );
};

// 初始化
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .card-header-text {
    font-size: 16px;
    font-weight: 500;
  }
}

.user-info {
  .nick-name {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .user-name {
    font-size: 12px;
    color: #909399;
  }
}

.amount-info {
  .amount-value {
    color: #67c23a;
    font-weight: bold;
    font-size: 15px;
  }

  .currency {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }
}
</style>
