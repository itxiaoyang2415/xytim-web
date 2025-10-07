<template>
  <el-dialog v-model="dialogVisible" title="用户充值记录" width="1200px" :close-on-click-modal="false">
    <!-- 用户信息 -->
    <el-descriptions :column="4" border class="mb-4">
      <el-descriptions-item label="用户ID">{{ userInfo.userId }}</el-descriptions-item>
      <el-descriptions-item label="用户名">{{ userInfo.userName }}</el-descriptions-item>
      <el-descriptions-item label="昵称">{{ userInfo.nickName }}</el-descriptions-item>
      <el-descriptions-item label="当前余额">
        <el-tag type="success">{{ userInfo.balance || 0 }} USDT</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 搜索栏 -->
    <el-form :model="queryParams" :inline="true" class="mb-3">
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

      <el-form-item label="支付渠道">
        <el-select v-model="queryParams.channel" placeholder="请选择" clearable style="width: 120px">
          <el-option label="后台充值" value="ADMIN" />
          <el-option label="支付宝" value="ALIPAY" />
          <el-option label="微信支付" value="WECHAT" />
          <el-option label="银行转账" value="BANK" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable style="width: 100px">
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

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="recordList" border max-height="400">
      <el-table-column label="订单号" align="center" prop="orderNo" width="180" show-overflow-tooltip />

      <el-table-column label="充值金额" align="center" prop="amount" width="120">
        <template #default="scope">
          <div class="amount-info">
            <span class="amount-value">+{{ scope.row.amount }}</span>
            <div class="currency">{{ scope.row.currency }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="充值前余额" align="center" prop="beforeBalance" width="110" />
      <el-table-column label="充值后余额" align="center" prop="afterBalance" width="110" />

      <el-table-column label="渠道" align="center" prop="channelName" width="100">
        <template #default="scope">
          <el-tag :type="getChannelType(scope.row.channel)" size="small">
            {{ scope.row.channelName }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="状态" align="center" prop="statusName" width="90">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)" size="small">
            {{ scope.row.statusName }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="备注" align="center" prop="remark" min-width="120" show-overflow-tooltip />

      <el-table-column label="完成时间" align="center" prop="completedTime" width="160">
        <template #default="scope">
          <span>{{ scope.row.completedTime || '-' }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="mt-3 flex justify-end">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getList"
        @current-change="getList"
      />
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
      <el-button type="primary" icon="Download" @click="handleExport">导出记录</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { getRechargeRecords } from '@/api/im/wallet';
import type { RechargeRecordQuery, AdminRechargeRecordVO } from '@/api/im/wallet/types';

defineOptions({
  name: 'UserRechargeRecordsDialog'
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// Props
interface Props {
  modelValue: boolean;
  userInfo: {
    userId: number;
    userName: string;
    nickName: string;
    balance: number;
  };
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  userInfo: () => ({
    userId: 0,
    userName: '',
    nickName: '',
    balance: 0
  })
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

// 弹窗显示状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// 加载状态
const loading = ref(false);

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

// 查询列表
const getList = async () => {
  if (!props.userInfo.userId) return;

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

    // 设置用户ID
    queryParams.userId = props.userInfo.userId;

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
  queryParams.channel = '';
  queryParams.status = undefined;
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
    ADMIN: 'primary',
    ALIPAY: 'success',
    WECHAT: 'success',
    BANK: 'warning'
  };
  return types[channel] || 'info';
};

// 导出
const handleExport = () => {
  proxy?.download(
    '/im/admin/wallet/recharge-records/export',
    {
      userId: props.userInfo.userId,
      startTime: queryParams.startTime,
      endTime: queryParams.endTime,
      channel: queryParams.channel,
      status: queryParams.status
    },
    `user_${props.userInfo.userId}_recharge_records_${new Date().getTime()}.xlsx`
  );
};

// 监听弹窗打开，加载数据
watch(dialogVisible, (val) => {
  if (val) {
    // 重置查询条件
    dateRange.value = null;
    queryParams.pageNum = 1;
    queryParams.pageSize = 10;
    queryParams.channel = '';
    queryParams.status = undefined;
    // 加载数据
    getList();
  }
});
</script>

<style scoped lang="scss">
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

.mb-3 {
  margin-bottom: 15px;
}

.mb-4 {
  margin-bottom: 20px;
}

.mt-3 {
  margin-top: 15px;
}

.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}
</style>
