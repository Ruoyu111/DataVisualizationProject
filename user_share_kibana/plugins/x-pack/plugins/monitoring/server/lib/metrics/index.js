import _ from 'lodash';

import {
  ElasticsearchMetric, RequestRateMetric, KibanaMetric, LatencyMetric,
  QuotaMetric, NodeIndexMemoryMetric, ThreadPoolQueueMetric,
  ThreadPoolRejectedMetric, IndexAverageStatMetric, SingleIndexMemoryMetric,
  IndexMemoryMetric, LogstashMetric, EventsLatencyMetric, LogstashEventsRateMetric
} from './metric_classes';

import {
  LARGE_FLOAT, SMALL_FLOAT, LARGE_BYTES, SMALL_BYTES, LARGE_ABBREVIATED
} from '../../../common/formatting';

const metricInstances = {
  'cluster_index_request_rate_primary': new RequestRateMetric({
    title: 'Indexing Rate', // title to use for the chart
    label: 'Primary Shards', // label to use for this line in the chart
    field: 'indices_stats._all.primaries.indexing.index_total',
    description: 'Number of documents being indexed for primary shards.',
    type: 'index'
  }),
  'cluster_index_request_rate_total': new RequestRateMetric({
    field: 'indices_stats._all.total.indexing.index_total',
    title: 'Indexing Rate',
    label: 'Total Shards',
    description: 'Number of documents being indexed for primary and replica shards.',
    type: 'index'
  }),
  'cluster_search_request_rate': new RequestRateMetric({
    field: 'indices_stats._all.total.search.query_total',
    title: 'Search Rate',
    label: 'Total Shards',
    description: 'Number of search requests being executed across primary and replica shards. A single search can run against multiple shards!', // eslint-disable-line max-len
    type: 'cluster'
  }),
  'cluster_index_latency': new LatencyMetric({
    metric: 'index',
    fieldSource: 'indices_stats._all.primaries',
    field: 'indices_stats._all.primaries.indexing.index_total',
    label: 'Indexing Latency',
    description: 'Average latency for indexing documents, which is time it takes to index documents divided by number that were indexed. This only considers primary shards.', // eslint-disable-line max-len
    type: 'cluster'
  }),
  'node_index_latency': new LatencyMetric({
    metric: 'index',
    fieldSource: 'node_stats.indices',
    field: 'node_stats.indices.indexing.index_total',
    title: 'Latency',
    label: 'Indexing',
    description: 'Average latency for indexing documents, which is time it takes to index documents divided by number that were indexed. This considers any shard located on this node, including replicas.', // eslint-disable-line max-len
    type: 'node'
  }),
  'index_latency': new LatencyMetric({
    metric: 'index',
    fieldSource: 'index_stats.primaries',
    field: 'index_stats.primaries.indexing.index_total',
    label: 'Indexing Latency',
    description: 'Average latency for indexing documents, which is time it takes to index documents divided by number that were indexed. This only considers primary shards.', // eslint-disable-line max-len
    type: 'cluster'
  }),
  'cluster_query_latency': new LatencyMetric({
    metric: 'query',
    fieldSource: 'indices_stats._all.total',
    field: 'indices_stats._all.total.search.query_total',
    label: 'Search Latency',
    description: 'Average latency for searching, which is time it takes to execute searches divided by number of searches submitted. This considers primary and replica shards.', // eslint-disable-line max-len
    type: 'cluster'
  }),
  'node_query_latency': new LatencyMetric({
    metric: 'query',
    fieldSource: 'node_stats.indices',
    field: 'node_stats.indices.search.query_total',
    title: 'Latency',
    label: 'Search',
    description: 'Average latency for searching, which is time it takes to execute searches divided by number of searches submitted. This considers primary and replica shards.', // eslint-disable-line max-len
    type: 'node'
  }),
  'query_latency': new LatencyMetric({
    metric: 'query',
    fieldSource: 'index_stats.total',
    field: 'index_stats.total.search.query_total',
    label: 'Search Latency',
    description: 'Average latency for searching, which is time it takes to execute searches divided by number of searches submitted. This considers primary and replica shards.', // eslint-disable-line max-len
    type: 'cluster'
  }),
  'index_indexing_primaries_time': new ElasticsearchMetric({
    field: 'index_stats.primaries.indexing.index_time_in_millis',
    title: 'Request Time',
    label: 'Indexing (Primaries)',
    description: 'Amount of time spent performing index operations on primary shards only.',
    type: 'index',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: 'ms'
  }),
  'index_indexing_total_time': new ElasticsearchMetric({
    field: 'index_stats.total.indexing.index_time_in_millis',
    title: 'Request Time',
    label: 'Indexing',
    description: 'Amount of time spent performing index operations on primary and replica shards.',
    type: 'index',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: 'ms'
  }),
  'index_indexing_total': new ElasticsearchMetric({
    field: 'index_stats.primaries.indexing.index_total',
    title: 'Request Rate',
    label: 'Index Total',
    description: 'Amount of indexing operations.',
    type: 'index',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'index_mem_overall': new SingleIndexMemoryMetric({
    field: 'memory_in_bytes',
    label: 'Lucene Total',
    description: 'Total heap memory used by Lucene for current index. This is the sum of other fields for primary and replica shards.'
  }),
  'index_mem_overall_1': new SingleIndexMemoryMetric({
    field: 'memory_in_bytes',
    title: 'Index Memory - Lucene 1',
    label: 'Lucene Total',
    description: 'Total heap memory used by Lucene for current index. This is the sum of other fields for primary and replica shards.'
  }),
  'index_mem_overall_2': new SingleIndexMemoryMetric({
    field: 'memory_in_bytes',
    title: 'Index Memory - Lucene 2',
    label: 'Lucene Total',
    description: 'Total heap memory used by Lucene for current index. This is the sum of other fields for primary and replica shards.'
  }),
  'index_mem_overall_3': new SingleIndexMemoryMetric({
    field: 'memory_in_bytes',
    title: 'Index Memory - Lucene 3',
    label: 'Lucene Total',
    description: 'Total heap memory used by Lucene for current index. This is the sum of other fields for primary and replica shards.'
  }),
  'index_mem_doc_values': new SingleIndexMemoryMetric({
    field: 'doc_values_memory_in_bytes',
    label: 'Doc Values',
    description: 'Heap memory used by Doc Values. This is a part of Lucene Total.'
  }),
  // Note: This is not segment memory, unlike SingleIndexMemoryMetrics
  'index_mem_fielddata': new IndexMemoryMetric({
    field: 'index_stats.total.fielddata.memory_size_in_bytes',
    label: 'Fielddata',
    description: 'Heap memory used by Fielddata (e.g., global ordinals or explicitly enabled fielddata on text fields). This is for the same shards, but not a part of Lucene Total.', // eslint-disable-line max-len
    type: 'index'
  }),
  'index_mem_fixed_bit_set': new SingleIndexMemoryMetric({
    field: 'fixed_bit_set_memory_in_bytes',
    label: 'Fixed Bitsets',
    description: 'Heap memory used by Fixed Bit Sets (e.g., deeply nested documents). This is a part of Lucene Total.'
  }),
  'index_mem_norms': new SingleIndexMemoryMetric({
    field: 'norms_memory_in_bytes',
    label: 'Norms',
    description: 'Heap memory used by Norms (normalization factors for query-time, text scoring). This is a part of Lucene Total.'
  }),
  'index_mem_points': new SingleIndexMemoryMetric({
    field: 'points_memory_in_bytes',
    label: 'Points',
    description: 'Heap memory used by Points (e.g., numbers, IPs, and geo data). This is a part of Lucene Total.'
  }),
  // Note: This is not segment memory, unlike SingleIndexMemoryMetrics
  'index_mem_query_cache': new IndexMemoryMetric({
    field: 'index_stats.total.query_cache.memory_size_in_bytes',
    label: 'Query Cache',
    description: 'Heap memory used by Query Cache (e.g., cached filters). This is for the same shards, but not a part of Lucene Total.',
    type: 'index'
  }),
  'index_mem_query_cache_4': new IndexMemoryMetric({
    field: 'index_stats.total.query_cache.memory_size_in_bytes',
    title: 'Index Memory - Elasticsearch',
    label: 'Query Cache',
    description: 'Heap memory used by Query Cache (e.g., cached filters). This is for the same shards, but not a part of Lucene Total.',
    type: 'index'
  }),
  // Note: This is not segment memory, unlike SingleIndexMemoryMetrics
  'index_mem_request_cache': new IndexMemoryMetric({
    field: 'index_stats.total.request_cache.memory_size_in_bytes',
    label: 'Request Cache',
    description: 'Heap memory used by Request Cache (e.g., instant aggregations). This is for the same shards, but not a part of Lucene Total.', // eslint-disable-line max-len
    type: 'index'
  }),
  'index_mem_stored_fields': new SingleIndexMemoryMetric({
    field: 'stored_fields_memory_in_bytes',
    label: 'Stored Fields',
    description: 'Heap memory used by Stored Fields (e.g., _source). This is a part of Lucene Total.'
  }),
  'index_mem_term_vectors': new SingleIndexMemoryMetric({
    field: 'term_vectors_memory_in_bytes',
    label: 'Term Vectors',
    description: 'Heap memory used by Term Vectors. This is a part of Lucene Total.'
  }),
  'index_mem_terms': new SingleIndexMemoryMetric({
    field: 'terms_memory_in_bytes',
    label: 'Terms',
    description: 'Heap memory used by Terms (e.g., text). This is a part of Lucene Total.'
  }),
  'index_mem_versions': new SingleIndexMemoryMetric({
    field: 'version_map_memory_in_bytes',
    label: 'Version Map',
    description: 'Heap memory used by Versioning (e.g., updates and deletes). This is NOT a part of Lucene Total.',
  }),
  'index_mem_writer': new SingleIndexMemoryMetric({
    field: 'index_writer_memory_in_bytes',
    label: 'Index Writer',
    description: 'Heap memory used by the Index Writer. This is NOT a part of Lucene Total.'
  }),
  'index_request_rate_primary': new ElasticsearchMetric({
    field: 'index_stats.primaries.indexing.index_total',
    title: 'Indexing Rate',
    label: 'Primary Shards',
    description: 'Number of documents being indexed for primary shards.',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: '/s',
    type: 'index',
    derivative: true
  }),
  'index_request_rate_total': new RequestRateMetric({
    field: 'index_stats.total.indexing.index_total',
    title: 'Indexing Rate',
    label: 'Total Shards',
    description: 'Number of documents being indexed for primary and replica shards.',
    type: 'index'
  }),
  'index_searching_time': new ElasticsearchMetric({
    field: 'index_stats.total.search.query_time_in_millis',
    title: 'Request Time',
    label: 'Search',
    description: 'Amount of time spent performing search operations (per shard).',
    type: 'index',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: 'ms'
  }),
  'index_searching_total': new ElasticsearchMetric({
    field: 'index_stats.total.search.query_total',
    title: 'Request Rate',
    label: 'Search Total',
    description: 'Amount of search operations (per shard).',
    type: 'index',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'index_segment_count_primaries': new ElasticsearchMetric({
    field: 'index_stats.primaries.segments.count',
    title: 'Segment Count',
    label: 'Primaries',
    description: 'Number of segments for primary shards.',
    type: 'index',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'index_segment_count_total': new ElasticsearchMetric({
    field: 'index_stats.total.segments.count',
    title: 'Segment Count',
    label: 'Total',
    description: 'Number of segments for primary and replica shards.',
    type: 'index',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'index_segment_merge_primaries_size': new ElasticsearchMetric({
    field: 'index_stats.primaries.merges.total_size_in_bytes',
    title: 'Disk',
    label: 'Merges (Primaries)',
    description: 'Size of merges on primary shards.',
    type: 'index',
    derivative: true,
    format: LARGE_BYTES,
    metricAgg: 'max',
    units: 'B'
  }),
  'index_segment_merge_total_size': new ElasticsearchMetric({
    field: 'index_stats.total.merges.total_size_in_bytes',
    title: 'Disk',
    label: 'Merges',
    description: 'Size of merges on primary and replica shards.',
    type: 'index',
    derivative: true,
    format: LARGE_BYTES,
    metricAgg: 'max',
    units: 'B'
  }),
  'index_segment_refresh_primaries_time': new ElasticsearchMetric({
    field: 'index_stats.primaries.refresh.total_time_in_millis',
    title: 'Refresh Time',
    label: 'Primaries',
    description: 'Amount of time spent to perform refresh operations on primary shards.',
    type: 'index',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: 'ms'
  }),
  'index_segment_refresh_total_time': new ElasticsearchMetric({
    field: 'index_stats.total.refresh.total_time_in_millis',
    title: 'Refresh Time',
    label: 'Total',
    description: 'Amount of time spent to perform refresh operations on primary and replica shards.',
    type: 'index',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: 'ms'
  }),
  'index_throttling_indexing_primaries_time': new ElasticsearchMetric({
    field: 'index_stats.primaries.indexing.throttle_time_in_millis',
    title: 'Throttle Time',
    label: 'Indexing (Primaries)',
    description: 'Amount of time spent throttling index operations on primary shards.',
    type: 'index',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: 'ms'
  }),
  'index_throttling_indexing_total_time': new ElasticsearchMetric({
    field: 'index_stats.total.indexing.throttle_time_in_millis',
    title: 'Throttle Time',
    label: 'Indexing',
    description: 'Amount of time spent throttling index operations on primary and replica shards.',
    type: 'index',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: 'ms'
  }),
  'index_store_primaries_size': new ElasticsearchMetric({
    field: 'index_stats.primaries.store.size_in_bytes',
    title: 'Disk',
    label: 'Store (Primaries)',
    description: 'Size of primary shards on disk.',
    type: 'index',
    derivative: false,
    format: LARGE_BYTES,
    metricAgg: 'max',
    units: 'B'
  }),
  'index_store_total_size': new ElasticsearchMetric({
    field: 'index_stats.total.store.size_in_bytes',
    title: 'Disk',
    label: 'Store',
    description: 'Size of primary and replica shards on disk.',
    type: 'index',
    derivative: false,
    format: LARGE_BYTES,
    metricAgg: 'max',
    units: 'B'
  }),
  'search_request_rate': new RequestRateMetric({
    field: 'index_stats.total.search.query_total',
    title: 'Search Rate',
    label: 'Total Shards',
    description: 'Number of search requests being executed across primary and replica shards. A single search can run against multiple shards!', // eslint-disable-line max-len
    type: 'cluster'
  }),
  'node_cgroup_periods': new ElasticsearchMetric({
    field: 'node_stats.os.cgroup.cpu.stat.number_of_elapsed_periods',
    title: 'Cgroup CFS Stats',
    label: 'Cgroup Elapsed Periods',
    description: (
      'The number of sampling periods from the Completely Fair Scheduler (CFS). Compare against the number of times throttled.'
    ),
    type: 'node',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    derivative: true,
    units: ''
  }),
  'node_cgroup_throttled': new ElasticsearchMetric({
    field: 'node_stats.os.cgroup.cpu.stat.time_throttled_nanos',
    title: 'Cgroup CPU Performance',
    label: 'Cgroup Throttling',
    description: 'The amount of throttled time, reported in nanoseconds, of the Cgroup.',
    type: 'node',
    format: LARGE_ABBREVIATED,
    metricAgg: 'max',
    derivative: true,
    units: 'ns'
  }),
  'node_cgroup_throttled_count': new ElasticsearchMetric({
    field: 'node_stats.os.cgroup.cpu.stat.number_of_times_throttled',
    title: 'Cgroup CFS Stats',
    label: 'Cgroup Throttled Count',
    description: 'The number of times that the CPU was throttled by the Cgroup.',
    type: 'node',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    derivative: true,
    units: ''
  }),
  'node_cgroup_usage': new ElasticsearchMetric({
    field: 'node_stats.os.cgroup.cpuacct.usage_nanos',
    title: 'Cgroup CPU Performance',
    label: 'Cgroup Usage',
    description: 'The usage, reported in nanoseconds, of the Cgroup. Compare this with the throttling to discover issues.',
    type: 'node',
    format: LARGE_ABBREVIATED,
    metricAgg: 'max',
    derivative: true,
    units: 'ns'
  }),
  ...(() => {
    // CGroup CPU Utilization Fields
    const quotaMetricConfig = {
      app: 'elasticsearch',
      uuidField: 'cluster_uuid',
      timestampField: 'timestamp',
      fieldSource: 'node_stats.os.cgroup',
      usageField: 'cpuacct.usage_nanos',
      periodsField: 'cpu.stat.number_of_elapsed_periods',
      quotaField: 'cpu.cfs_quota_micros',
      field: 'node_stats.process.cpu.percent', // backup field if quota is not configured
      label: 'Cgroup CPU Utilization',
      description: (
        'CPU Usage time compared to the CPU quota shown in percentage. If CPU ' +
        'quotas are not set, then the OS level CPU usage in percentage is shown.'
      ),
      type: 'node'
    };
    return {
      'node_cgroup_quota': new QuotaMetric({
        ...quotaMetricConfig,
        title: 'CPU Utilization'
      }),
      'node_cgroup_quota_as_cpu_utilization': new QuotaMetric({
        ...quotaMetricConfig,
        label: 'CPU Utilization' //  override the "Cgroup CPU..." label
      })
    };
  })(),
  'node_cpu_utilization': new ElasticsearchMetric({
    field: 'node_stats.process.cpu.percent',
    label: 'CPU Utilization',
    description: 'Percentage of CPU usage reported by the OS (100% is the max).',
    type: 'node',
    format: LARGE_FLOAT,
    metricAgg: 'avg',
    units: '%'
  }),
  'node_segment_count': new ElasticsearchMetric({
    field: 'node_stats.indices.segments.count',
    label: 'Segment Count',
    description: 'Maximum segment count for primary and replica shards on this node.',
    type: 'node',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'node_jvm_gc_old_count': new ElasticsearchMetric({
    field: 'node_stats.jvm.gc.collectors.old.collection_count',
    title: 'GC Count',
    label: 'Old',
    description: 'Number of old Garbage Collections.',
    derivative: true,
    format: SMALL_FLOAT,
    metricAgg: 'max',
    units: '',
    type: 'node'
  }),
  'node_jvm_gc_old_time': new ElasticsearchMetric({
    field: 'node_stats.jvm.gc.collectors.old.collection_time_in_millis',
    title: 'GC Duration',
    label: 'Old',
    derivative: true,
    description: 'Time spent performing old Garbage Collections.',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: 'ms',
    type: 'node'
  }),
  'node_jvm_gc_young_count': new ElasticsearchMetric({
    field: 'node_stats.jvm.gc.collectors.young.collection_count',
    title: 'GC Count',
    label: 'Young',
    description: 'Number of young Garbage Collections.',
    derivative: true,
    format: SMALL_FLOAT,
    metricAgg: 'max',
    units: '',
    type: 'node'
  }),
  'node_jvm_gc_young_time': new ElasticsearchMetric({
    field: 'node_stats.jvm.gc.collectors.young.collection_time_in_millis',
    title: 'GC Duration',
    label: 'Young',
    description: 'Time spent performing young Garbage Collections.',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: 'ms',
    type: 'node'
  }),
  'node_jvm_mem_max_in_bytes': new ElasticsearchMetric({
    field: 'node_stats.jvm.mem.heap_max_in_bytes',
    title: 'JVM Heap',
    label: 'Max Heap',
    description: 'Total heap available to Elasticsearch running in the JVM.',
    type: 'node',
    format: SMALL_BYTES,
    metricAgg: 'max',
    units: 'B'
  }),
  'node_jvm_mem_used_in_bytes': new ElasticsearchMetric({
    field: 'node_stats.jvm.mem.heap_used_in_bytes',
    title: 'JVM Heap',
    label: 'Used Heap',
    description: 'Total heap used by Elasticsearch running in the JVM.',
    type: 'node',
    format: SMALL_BYTES,
    metricAgg: 'max',
    units: 'B'
  }),
  'node_jvm_mem_percent': new ElasticsearchMetric({
    field: 'node_stats.jvm.mem.heap_used_percent',
    title: 'JVM Heap',
    label: 'Used Heap',
    description: 'Total heap used by Elasticsearch running in the JVM.',
    type: 'node',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: '%'
  }),
  'node_load_average': new ElasticsearchMetric({
    field: 'node_stats.os.cpu.load_average.1m',
    title: 'System Load',
    label: '1m',
    description: 'Load average over the last minute.',
    type: 'node',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'node_index_mem_overall': new NodeIndexMemoryMetric({
    field: 'memory_in_bytes',
    label: 'Lucene Total',
    description: 'Total heap memory used by Lucene for current index. This is the sum of other fields for primary and replica shards on this node.' // eslint-disable-line max-len
  }),
  'node_index_mem_overall_1': new NodeIndexMemoryMetric({
    field: 'memory_in_bytes',
    label: 'Lucene Total',
    title: 'Index Memory - Lucene 1',
    description: 'Total heap memory used by Lucene for current index. This is the sum of other fields for primary and replica shards on this node.' // eslint-disable-line max-len
  }),
  'node_index_mem_overall_2': new NodeIndexMemoryMetric({
    field: 'memory_in_bytes',
    label: 'Lucene Total',
    title: 'Index Memory - Lucene 2',
    description: 'Total heap memory used by Lucene for current index. This is the sum of other fields for primary and replica shards on this node.' // eslint-disable-line max-len
  }),
  'node_index_mem_overall_3': new NodeIndexMemoryMetric({
    field: 'memory_in_bytes',
    label: 'Lucene Total',
    title: 'Index Memory - Lucene 3',
    description: 'Total heap memory used by Lucene for current index. This is the sum of other fields for primary and replica shards on this node.' // eslint-disable-line max-len
  }),
  'node_index_mem_doc_values': new NodeIndexMemoryMetric({
    field: 'doc_values_memory_in_bytes',
    label: 'Doc Values',
    description: 'Heap memory used by Doc Values. This is a part of Lucene Total.'
  }),
  // Note: This is not segment memory, unlike the rest of the SingleIndexMemoryMetrics
  'node_index_mem_fielddata': new IndexMemoryMetric({
    field: 'node_stats.indices.fielddata.memory_size_in_bytes',
    label: 'Fielddata',
    description: 'Heap memory used by Fielddata (e.g., global ordinals or explicitly enabled fielddata on text fields). This is for the same shards, but not a part of Lucene Total.', // eslint-disable-line max-len
    type: 'node'
  }),
  'node_index_mem_fixed_bit_set': new NodeIndexMemoryMetric({
    field: 'fixed_bit_set_memory_in_bytes',
    label: 'Fixed Bitsets',
    description: 'Heap memory used by Fixed Bit Sets (e.g., deeply nested documents). This is a part of Lucene Total.'
  }),
  'node_index_mem_norms': new NodeIndexMemoryMetric({
    field: 'norms_memory_in_bytes',
    label: 'Norms',
    description: 'Heap memory used by Norms (normalization factors for query-time, text scoring). This is a part of Lucene Total.'
  }),
  'node_index_mem_points': new NodeIndexMemoryMetric({
    field: 'points_memory_in_bytes',
    label: 'Points',
    description: 'Heap memory used by Points (e.g., numbers, IPs, and geo data). This is a part of Lucene Total.'
  }),
  // Note: This is not segment memory, unlike SingleIndexMemoryMetrics
  'node_index_mem_query_cache': new IndexMemoryMetric({
    field: 'node_stats.indices.query_cache.memory_size_in_bytes',
    label: 'Query Cache',
    description: 'Heap memory used by Query Cache (e.g., cached filters). This is for the same shards, but not a part of Lucene Total.',
    type: 'node'
  }),
  'node_index_mem_query_cache_4': new IndexMemoryMetric({
    field: 'node_stats.indices.query_cache.memory_size_in_bytes',
    label: 'Query Cache',
    title: 'Index Memory - Elasticsearch',
    description: 'Heap memory used by Query Cache (e.g., cached filters). This is for the same shards, but not a part of Lucene Total.',
    type: 'node'
  }),
  // Note: This is not segment memory, unlike SingleIndexMemoryMetrics
  'node_index_mem_request_cache': new IndexMemoryMetric({
    field: 'node_stats.indices.request_cache.memory_size_in_bytes',
    label: 'Request Cache',
    description: 'Heap memory used by Request Cache (e.g., instant aggregations). This is for the same shards, but not a part of Lucene Total.', // eslint-disable-line max-len
    type: 'node'
  }),
  'node_index_mem_stored_fields': new NodeIndexMemoryMetric({
    field: 'stored_fields_memory_in_bytes',
    label: 'Stored Fields',
    description: 'Heap memory used by Stored Fields (e.g., _source). This is a part of Lucene Total.'
  }),
  'node_index_mem_term_vectors': new NodeIndexMemoryMetric({
    field: 'term_vectors_memory_in_bytes',
    label: 'Term Vectors',
    description: 'Heap memory used by Term Vectors. This is a part of Lucene Total.'
  }),
  'node_index_mem_terms': new NodeIndexMemoryMetric({
    field: 'terms_memory_in_bytes',
    label: 'Terms',
    description: 'Heap memory used by Terms (e.g., text). This is a part of Lucene Total.'
  }),
  'node_index_mem_versions': new NodeIndexMemoryMetric({
    field: 'version_map_memory_in_bytes',
    label: 'Version Map',
    description: 'Heap memory used by Versioning (e.g., updates and deletes). This is NOT a part of Lucene Total.'
  }),
  'node_index_mem_writer': new NodeIndexMemoryMetric({
    field: 'index_writer_memory_in_bytes',
    label: 'Index Writer',
    description: 'Heap memory used by the Index Writer. This is NOT a part of Lucene Total.'
  }),
  'node_index_threads_bulk_queue': new ElasticsearchMetric({
    field: 'node_stats.thread_pool.bulk.queue',
    title: 'Indexing Threads',
    label: 'Bulk Queue',
    description: 'Number of bulk operations in the queue.',
    type: 'node',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: '',
    min: 0
  }),
  'node_index_threads_bulk_rejected': new ElasticsearchMetric({
    field: 'node_stats.thread_pool.bulk.rejected',
    title: 'Indexing Threads',
    label: 'Bulk Rejections',
    description: 'Number of bulk operations that have been rejected, which occurs when the queue is full.',
    type: 'node',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: '',
    min: 0
  }),
  'node_index_threads_get_queue': new ElasticsearchMetric({
    field: 'node_stats.thread_pool.get.queue',
    title: 'Read Threads',
    label: 'GET Queue',
    description: 'Number of GET operations in the queue.',
    type: 'node',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: '',
    min: 0
  }),
  'node_index_threads_get_rejected': new ElasticsearchMetric({
    field: 'node_stats.thread_pool.get.rejected',
    title: 'Read Threads',
    label: 'GET Rejections',
    description: 'Number of GET operations that have been rejected, which occurs when the queue is full.',
    type: 'node',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: '',
    min: 0
  }),
  'node_index_threads_index_queue': new ElasticsearchMetric({
    field: 'node_stats.thread_pool.index.queue',
    title: 'Indexing Threads',
    label: 'Index Queue',
    description: 'Number of non-bulk, index operations in the queue.',
    type: 'node',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: '',
    min: 0
  }),
  'node_index_threads_index_rejected': new ElasticsearchMetric({
    field: 'node_stats.thread_pool.index.rejected',
    title: 'Indexing Threads',
    label: 'Index Rejections',
    description:
      'Number of non-bulk, index operations that have been rejected, which occurs when the queue is full. ' +
      'Generally indicates that bulk should be used.',
    type: 'node',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: '',
    min: 0
  }),
  'node_index_threads_search_queue': new ElasticsearchMetric({
    field: 'node_stats.thread_pool.search.queue',
    title: 'Read Threads',
    label: 'Search Queue',
    description: 'Number of search operations in the queue (e.g., shard level searches).',
    type: 'node',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: '',
    min: 0
  }),
  'node_index_threads_search_rejected': new ElasticsearchMetric({
    field: 'node_stats.thread_pool.search.rejected',
    title: 'Read Threads',
    label: 'Search Rejections',
    description: 'Number of search operations that have been rejected, which occurs when the queue is full.',
    type: 'node',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: '',
    min: 0
  }),
  'node_index_total': new ElasticsearchMetric({
    field: 'node_stats.indices.indexing.index_total',
    title: 'Request Rate',
    label: 'Indexing Total',
    description: 'Amount of indexing operations.',
    type: 'node',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'node_index_time': new ElasticsearchMetric({
    field: 'node_stats.indices.indexing.index_time_in_millis',
    title: 'Indexing Time',
    label: 'Index Time',
    description: 'Amount of time spent on indexing operations.',
    type: 'node',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: 'ms'
  }),
  'node_free_space': new ElasticsearchMetric({
    field: 'node_stats.fs.total.available_in_bytes',
    label: 'Disk Free Space',
    description: 'Free disk space available on the node.',
    type: 'node',
    format: SMALL_BYTES,
    metricAgg: 'max',
    units: ''
  }),
  'node_search_total': new ElasticsearchMetric({
    field: 'node_stats.indices.search.query_total',
    title: 'Request Rate',
    label: 'Search Total',
    description: 'Amount of search operations (per shard).',
    type: 'node',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'node_threads_queued_bulk': new ThreadPoolQueueMetric({
    field: 'node_stats.thread_pool.bulk.queue',
    label: 'Bulk',
    description: 'Number of bulk indexing operations waiting to be processed on this node. A single bulk request can create multiple bulk operations.' // eslint-disable-line max-len
  }),
  'node_threads_queued_generic': new ThreadPoolQueueMetric({
    field: 'node_stats.thread_pool.generic.queue',
    label: 'Generic',
    description: 'Number of generic (internal) operations waiting to be processed on this node.'
  }),
  'node_threads_queued_get': new ThreadPoolQueueMetric({
    field: 'node_stats.thread_pool.get.queue',
    title: 'Thread Queue',
    label: 'Get',
    description: 'Number of get operations waiting to be processed on this node.'
  }),
  'node_threads_queued_index': new ThreadPoolQueueMetric({
    field: 'node_stats.thread_pool.index.queue',
    label: 'Index',
    description: 'Number of non-bulk, index operations waiting to be processed on this node.'
  }),
  'node_threads_queued_management': new ThreadPoolQueueMetric({
    field: 'node_stats.thread_pool.management.queue',
    label: 'Management',
    description: 'Number of management (internal) operations waiting to be processed on this node.'
  }),
  'node_threads_queued_search': new ThreadPoolQueueMetric({
    field: 'node_stats.thread_pool.search.queue',
    label: 'Search',
    description: 'Number of search operations waiting to be processed on this node. A single search request can create multiple search operations.' // eslint-disable-line max-len
  }),
  'node_threads_queued_watcher': new ThreadPoolQueueMetric({
    field: 'node_stats.thread_pool.watcher.queue',
    label: 'Watcher',
    description: 'Number of Watcher operations waiting to be processed on this node.'
  }),
  'node_threads_rejected_bulk': new ThreadPoolRejectedMetric({
    field: 'node_stats.thread_pool.bulk.rejected',
    label: 'Bulk',
    description: 'Bulk rejections. These occur when the queue is full.'
  }),
  'node_threads_rejected_generic': new ThreadPoolRejectedMetric({
    field: 'node_stats.thread_pool.generic.rejected',
    label: 'Generic',
    description: 'Generic (internal) rejections. These occur when the queue is full.'
  }),
  'node_threads_rejected_get': new ThreadPoolRejectedMetric({
    field: 'node_stats.thread_pool.get.rejected',
    label: 'Get',
    description: 'Get rejections. These occur when the queue is full.'
  }),
  'node_threads_rejected_index': new ThreadPoolRejectedMetric({
    field: 'node_stats.thread_pool.index.rejected',
    label: 'Index',
    description: 'Index rejections. These occur when the queue is full. You should look at bulk indexing.'
  }),
  'node_threads_rejected_management': new ThreadPoolRejectedMetric({
    field: 'node_stats.thread_pool.management.rejected',
    label: 'Management',
    description: 'Get (internal) rejections. These occur when the queue is full.'
  }),
  'node_threads_rejected_search': new ThreadPoolRejectedMetric({
    field: 'node_stats.thread_pool.search.rejected',
    label: 'Search',
    description: 'Search rejections. These occur when the queue is full. This can indicate over-sharding.'
  }),
  'node_threads_rejected_watcher': new ThreadPoolRejectedMetric({
    field: 'node_stats.thread_pool.watcher.rejected',
    label: 'Watcher',
    description: 'Watch rejections. These occur when the queue is full. This can indicate stuck-Watches.'
  }),
  'node_throttle_index_time': new ElasticsearchMetric({
    field: 'node_stats.indices.indexing.throttle_time_in_millis',
    title: 'Indexing Time',
    label: 'Index Throttling Time',
    description: 'Amount of time spent with index throttling, which indicates slow disks on a node.',
    type: 'node',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: 'ms',
    min: 0
  }),
  'index_throttle_time': new ElasticsearchMetric({
    field: 'index_stats.primaries.indexing.throttle_time_in_millis',
    label: 'Index Throttling Time',
    description: 'Amount of time spent with index throttling, which indicates slow merging.',
    type: 'index',
    derivative: true,
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: 'ms'
  }),
  'index_document_count': new ElasticsearchMetric({
    field: 'index_stats.primaries.docs.count',
    label: 'Document Count',
    description: 'Total number of documents, only including primary shards.',
    type: 'index',
    format: LARGE_ABBREVIATED,
    metricAgg: 'max',
    units: ''
  }),
  'index_search_request_rate': new RequestRateMetric({
    field: 'index_stats.total.search.query_total',
    title: 'Search Rate',
    label: 'Total Shards',
    description: 'Number of search requests being executed across primary and replica shards. A single search can run against multiple shards!', // eslint-disable-line max-len
    type: 'index'
  }),
  'index_merge_rate': new RequestRateMetric({
    field: 'index_stats.total.merges.total_size_in_bytes',
    label: 'Merge Rate',
    description: 'Amount in bytes of merged segments. Larger numbers indicate heavier disk activity.',
    type: 'index'
  }),
  'index_size': new IndexAverageStatMetric({
    field: 'index_stats.total.store.size_in_bytes',
    label: 'Index Size',
    description: 'Size of the index on disk for primary and replica shards.'
  }),
  'index_refresh_time': new ElasticsearchMetric({
    field: 'total.refresh.total_time_in_millis',
    label: 'Total Refresh Time',
    description: 'Time spent on Elasticsearch refresh for primary and replica shards.',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: '',
    type: 'index',
    derivative: true
  }),
  'kibana_os_load_1m': new KibanaMetric({
    title: 'System Load',
    field: 'kibana_stats.os.load.1m',
    label: '1m',
    description: 'Load average over the last minute.',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'kibana_os_load_5m': new KibanaMetric({
    title: 'System Load',
    field: 'kibana_stats.os.load.5m',
    label: '5m',
    description: 'Load average over the last 5 minutes.',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'kibana_os_load_15m': new KibanaMetric({
    title: 'System Load',
    field: 'kibana_stats.os.load.15m',
    label: '15m',
    description: 'Load average over the last 15 minutes.',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'kibana_memory_heap_size_limit': new KibanaMetric({
    title: 'Memory Size',
    field: 'kibana_stats.process.memory.heap.size_limit',
    label: 'Heap Size Limit',
    description: 'Limit of memory usage before garbage collection.',
    format: LARGE_BYTES,
    metricAgg: 'max',
    units: 'B'
  }),
  'kibana_memory_size': new KibanaMetric({
    title: 'Memory Size',
    field: 'kibana_stats.process.memory.resident_set_size_in_bytes',
    label: 'Memory Size',
    description: 'Total heap used by Kibana running in Node.js.',
    format: LARGE_BYTES,
    metricAgg: 'max',
    units: 'B'
  }),
  'kibana_process_delay': new KibanaMetric({
    field: 'kibana_stats.process.event_loop_delay',
    label: 'Event Loop Delay',
    description: 'Delay in Kibana server event loops. Longer delays may indicate blocking events in server thread, such as synchronous functions taking large amount of CPU time.', // eslint-disable-line max-len
    format: SMALL_FLOAT,
    metricAgg: 'max',
    units: 'ms'
  }),
  'kibana_average_response_times': new KibanaMetric({
    title: 'Client Response Time',
    field: 'kibana_stats.response_times.average',
    label: 'Average',
    description: 'Average response time for client requests to the Kibana instance.',
    format: SMALL_FLOAT,
    metricAgg: 'max',
    units: 'ms'
  }),
  'kibana_max_response_times': new KibanaMetric({
    title: 'Client Response Time',
    field: 'kibana_stats.response_times.max',
    label: 'Max',
    description: 'Maximum response time for client requests to the Kibana instance.',
    format: SMALL_FLOAT,
    metricAgg: 'max',
    units: 'ms'
  }),
  'kibana_average_concurrent_connections': new KibanaMetric({
    field: 'kibana_stats.concurrent_connections',
    label: 'HTTP Connections',
    description: 'Total number of open socket connections to the Kibana instance.',
    format: SMALL_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'kibana_requests': new KibanaMetric({
    field: 'kibana_stats.requests.total',
    label: 'Client Requests',
    description: 'Total number of client requests received by the Kibana instance.',
    format: SMALL_FLOAT,
    metricAgg: 'sum',
    units: ''
  }),
  'logstash_events_input_rate': new LogstashEventsRateMetric({
    field: 'logstash_stats.events.in',
    label: 'Events Received Rate',
    description: 'Total number of events received by the Logstash node at the inputs stage.',
  }),
  'logstash_events_output_rate': new LogstashEventsRateMetric({
    field: 'logstash_stats.events.out',
    label: 'Events Emitted Rate',
    description: 'Total number of events emitted by the Logstash node at the outputs stage.',
  }),
  'logstash_events_latency': new EventsLatencyMetric({
    field: 'logstash_stats.events.out',
    label: 'Event Latency',
    description: (
      'Average time spent by events in the filter and output stages, which is the total ' +
      'time it takes to process events divided by number of events emitted.'
    ),
  }),
  'logstash_os_load_1m': new LogstashMetric({
    title: 'System Load',
    field: 'logstash_stats.os.cpu.load_average.1m',
    label: '1m',
    description: 'Load average over the last minute.',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'logstash_os_load_5m': new LogstashMetric({
    title: 'System Load',
    field: 'logstash_stats.os.cpu.load_average.5m',
    label: '5m',
    description: 'Load average over the last 5 minutes.',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'logstash_os_load_15m': new LogstashMetric({
    title: 'System Load',
    field: 'logstash_stats.os.cpu.load_average.15m',
    label: '15m',
    description: 'Load average over the last 15 minutes.',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    units: ''
  }),
  'logstash_node_jvm_mem_max_in_bytes': new LogstashMetric({
    field: 'logstash_stats.jvm.mem.heap_max_in_bytes',
    title: 'JVM Heap',
    label: 'Max Heap',
    description: 'Total heap available to Logstash running in the JVM.',
    format: SMALL_BYTES,
    metricAgg: 'max',
    units: 'B'
  }),
  'logstash_node_jvm_mem_used_in_bytes': new LogstashMetric({
    field: 'logstash_stats.jvm.mem.heap_used_in_bytes',
    title: 'JVM Heap',
    label: 'Used Heap',
    description: 'Total heap used by Logstash running in the JVM.',
    format: SMALL_BYTES,
    metricAgg: 'max',
    units: 'B'
  }),
  'logstash_node_cpu_utilization': new LogstashMetric({
    field: 'logstash_stats.process.cpu.percent',
    label: 'CPU Utilization',
    description: 'Percentage of CPU usage reported by the OS (100% is the max).',
    format: LARGE_FLOAT,
    metricAgg: 'avg',
    units: '%'
  }),
  'logstash_node_cgroup_periods': new LogstashMetric({
    field: 'logstash_stats.os.cgroup.cpu.stat.number_of_elapsed_periods',
    title: 'Cgroup CFS Stats',
    label: 'Cgroup Elapsed Periods',
    description: (
      'The number of sampling periods from the Completely Fair Scheduler (CFS). Compare against the number of times throttled.'
    ),
    format: LARGE_FLOAT,
    metricAgg: 'max',
    derivative: true,
    units: ''
  }),
  'logstash_node_cgroup_throttled': new LogstashMetric({
    field: 'logstash_stats.os.cgroup.cpu.stat.time_throttled_nanos',
    title: 'Cgroup CPU Performance',
    label: 'Cgroup Throttling',
    description: 'The amount of throttled time, reported in nanoseconds, of the Cgroup.',
    format: LARGE_ABBREVIATED,
    metricAgg: 'max',
    derivative: true,
    units: 'ns'
  }),
  'logstash_node_cgroup_throttled_count': new LogstashMetric({
    field: 'logstash_stats.os.cgroup.cpu.stat.number_of_times_throttled',
    title: 'Cgroup CFS Stats',
    label: 'Cgroup Throttled Count',
    description: 'The number of times that the CPU was throttled by the Cgroup.',
    format: LARGE_FLOAT,
    metricAgg: 'max',
    derivative: true,
    units: ''
  }),
  'logstash_node_cgroup_usage': new LogstashMetric({
    field: 'logstash_stats.os.cgroup.cpuacct.usage_nanos',
    title: 'Cgroup CPU Performance',
    label: 'Cgroup Usage',
    description: 'The usage, reported in nanoseconds, of the Cgroup. Compare this with the throttling to discover issues.',
    format: LARGE_ABBREVIATED,
    metricAgg: 'max',
    derivative: true,
    units: 'ns'
  }),
  ...(() => {
    // CGroup CPU Utilization Fields
    const quotaMetricConfig = {
      app: 'logstash',
      uuidField: 'logstash_stats.logstash.uuid',
      timestampField: 'logstash_stats.timestamp',
      fieldSource: 'logstash_stats.os.cgroup',
      usageField: 'cpuacct.usage_nanos',
      periodsField: 'cpu.stat.number_of_elapsed_periods',
      quotaField: 'cpu.cfs_quota_micros',
      field: 'logstash_stats.process.cpu.percent', // backup field if quota is not configured
      label: 'Cgroup CPU Utilization',
      description: (
        'CPU Usage time compared to the CPU quota shown in percentage. If CPU ' +
        'quotas are not set, then the OS level CPU usage in percentage is shown.'
      )
    };
    return {
      'logstash_node_cgroup_quota': new QuotaMetric({
        ...quotaMetricConfig,
        title: 'CPU Utilization'
      }),
      'logstash_node_cgroup_quota_as_cpu_utilization': new QuotaMetric({
        ...quotaMetricConfig,
        label: 'CPU Utilization' //  override the "Cgroup CPU..." label
      })
    };
  })(),
  'logstash_queue_events_count': new LogstashMetric({
    field: 'logstash_stats.queue.events_count',
    label: 'Events Queued',
    description: 'Number of events in the persisted queue waiting to be processed by the filter and output stages.',
    format: LARGE_FLOAT,
    metricAgg: 'avg',
    units: ''
  })
};

const metrics = _.reduce(Object.keys(metricInstances), (accumulated, key) => {
  accumulated[key] = metricInstances[key].toPlainObject();
  return accumulated;
}, {});

export default metrics;