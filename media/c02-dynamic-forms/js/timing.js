window.TIMING = {
 "fps": 30,
 "scenes": {
  "s00-title": {
   "duration": 9.6,
   "segments": {
    "title-1": {
     "start": 0.8,
     "end": 8.4,
     "text": "Item WMS 动态表单：让懂 WMS 的 Agent，把现场需求直接变成业务应用。"
    }
   }
  },
  "s01-pain": {
   "duration": 42.46,
   "segments": {
    "pain-1": {
     "start": 0.4,
     "end": 14.92,
     "text": "仓库现场每天都有新需求：异常登记、状态采集、任务确认、临时分析。传统做法是，需求从现场出发，经过支持和实施团队、产品经理、开发、测试，最后上线。"
    },
    "pain-2": {
     "start": 15.37,
     "end": 26.13,
     "text": "每多一次转述，业务背景、核心痛点和优先级就多一分损耗。周期也长，上线后想改一处，又要把整条链路重走一遍。"
    },
    "pain-3": {
     "start": 26.58,
     "end": 41.46,
     "text": "现在，提出需求的人直接和 Agent 对话。Agent 当场给出初版，现场直接试用，哪里不对就直接改。没有转述，一手语境不丢；一轮迭代，在一次对话里完成。"
    }
   }
  },
  "s02-ontology": {
   "duration": 50.4,
   "segments": {
    "onto-1": {
     "start": 0.4,
     "end": 21.32,
     "text": "直接对话能成立，前提是 Agent 真正懂 WMS。所以我们让它直接长在 WMS 内部。它的背后，是 Item Ontology，也就是 WMS 的业务本体：业务对象、业务流程、业务规则、业务配置、业务接口，以及工程知识。"
    },
    "onto-2": {
     "start": 21.77,
     "end": 34.69,
     "text": "再加上按操作索引的接口目录和一组内部 Skill，Agent 知道系统有哪些接口、权限和规则在哪里生效，也理解业务概念和流程之间的关系。"
    },
    "onto-3": {
     "start": 35.14,
     "end": 47.9,
     "text": "它还理解 GenUI，也就是生成式界面的架构：有哪些组件可以组合、数据存在哪里、怎样发布。所以它生成的东西，从一开始就符合 WMS 的约定。"
    }
   }
  },
  "s03-permission": {
   "duration": 36.94,
   "segments": {
    "perm-1": {
     "start": 0.4,
     "end": 11.56,
     "text": "权限上，Agent 是用户的代理，不是超级用户。它使用当前用户登录后委托的 WMS 令牌，以用户本人的身份调用接口。"
    },
    "perm-2": {
     "start": 12.01,
     "end": 28.93,
     "text": "所以，用户能做的，都可以交给 Agent 去做。用户做不了的，Agent 也做不了：角色没有的接口，直接拒绝；没授权的仓库、没指派给自己的任务，同样碰不到。Agent 的权限上限，就是用户本人。"
    },
    "perm-3": {
     "start": 29.38,
     "end": 35.94,
     "text": "每一次写入都会落进数据变更日志，并记录是哪个页面的哪个版本发起的。"
    }
   }
  },
  "s04-concepts": {
   "duration": 46.39,
   "segments": {
    "conc-1": {
     "start": 0.4,
     "end": 9.04,
     "text": "GenUI 有四个核心概念。第一，Dynamic Card，在对话里做轻量交互，比如一次确认、一张结果表。"
    },
    "conc-2": {
     "start": 9.49,
     "end": 20.93,
     "text": "第二，Dynamic Task。当工作需要多步、需要在现场执行，Agent 和员工在对话里商定完整计划，直接生成一个沉浸式的手机任务页。"
    },
    "conc-3": {
     "start": 21.38,
     "end": 32.46,
     "text": "第三，Save as Task Type。满意的任务可以沉淀为 Dynamic Task Type，成为日常应用，有版本，有草稿、试运行和发布。"
    },
    "conc-4": {
     "start": 32.91,
     "end": 45.39,
     "text": "第四，导入导出。在测试环境开发和验证，导出成一个包文件；到生产环境导入时一律落为草稿，再走审核、试运行和发布。"
    }
   }
  },
  "s05-storage": {
   "duration": 45.3,
   "segments": {
    "stor-1": {
     "start": 0.4,
     "end": 23.12,
     "text": "Agent 组合应用时不需要建表。GenUI 架构为每个 Dynamic Task 提供通用的三层存储，每一层的结构由 Agent 按场景在任务定义里定制，存为 JSON 文档，写入时校验。以巡检为例，Task Context 是一个文档，记录任务是关于什么。"
    },
    "stor-2": {
     "start": 23.57,
     "end": 38.25,
     "text": "Task Lines 和 Task Records 是同一种机制：类似 MongoDB 的文档集合，按声明校验，全程审计。Lines 存放任务明细，记录要做什么；Records 记录现场采集到了什么。"
    },
    "stor-3": {
     "start": 38.7,
     "end": 44.3,
     "text": "业务事实仍然留在它所属的业务对象里，任务数据只引用它们。"
    }
   }
  },
  "s06-page": {
   "duration": 38.85,
   "segments": {
    "pobj-1": {
     "start": 0.4,
     "end": 21,
     "text": "手机端是 Dynamic Task，Web 端对应的就是 Dynamic Page：同样由 GenUI 动态构建，调度台、审核队列、统计看板、查询工具，都可以按需生成。它由 Agent 起草，有权限的人发布，发布后出现在侧边栏，和普通页面一样直接打开。"
    },
    "pobj-v": {
     "start": 21.45,
     "end": 37.85,
     "text": "看板上的统计和图表，并不是直接查一张表。数据来自 Dynamic View API：一段只读代码调用多个 WMS 现有接口，计数、分组、汇总，整理成组件需要的形状，页面拿来直接绑定。"
    }
   }
  },
  "s07-view": {
   "duration": 35.25,
   "segments": {
    "view-1": {
     "start": 0.4,
     "end": 17.04,
     "text": "具体来说，Dynamic View API 像页面专用的只读接口：Agent 用 TypeScript 写 view 函数，整合多个 WMS 现有接口，计算、拼装成界面要的数据，一次返回给页面、卡片或任务页。"
    },
    "view-2": {
     "start": 17.49,
     "end": 34.25,
     "text": "代码按内容哈希不可变地保存，在 WebAssembly 沙箱里运行：没有文件系统，没有环境变量，不能访问其他网络。它只拿到当前用户的只读令牌，只能查询、不能写入，权限也不会超过用户本人。"
    }
   }
  },
  "s07b-object": {
   "duration": 61.59,
   "segments": {
    "obj-1": {
     "start": 0.4,
     "end": 29.6,
     "text": "需要长期保存的客户数据，用 Custom Object。以仓库常见的增值服务为例：Agent 按客户的要求起草 VAS 单这个对象类型，有权限的人审核发布。每张 VAS 单的单头记录客户、出库单和交期，还有自己的状态流转；每条 VAS 指令是一行明细，比如贴价签、捆包、放说明书；现场完成的数量和照片，记进 Records。"
    },
    "obj-2": {
     "start": 30.05,
     "end": 60.09,
     "text": "Custom Object 和 Dynamic Task 用的是同一套三层存储：Object Header 对应 Task Context，Lines 和 Records 直接复用同一套文档集合引擎。区别是任务做完就关闭，对象会长期存在，被多个任务引用，比如这张 VAS 单由三个任务分别完成。和入库单、出库单一样，都是单头、明细、记录；Agent 用同一套结构为客户建模，自然贴合 WMS 的方式。"
    }
   }
  },
  "s08-composable": {
   "duration": 57.38,
   "segments": {
    "comp-1": {
     "start": 0.4,
     "end": 22.04,
     "text": "另一块基石是 composable step。随着系统演进，我们会发现反复出现的常用模块，把它们抽象成可组合的步骤，供 Agent 和用户按需选用。Move Inventory 就是一个例子：WMS 里大量底层库存操作，本质上都是先 Take，再 Place。"
    },
    "comp-2": {
     "start": 22.49,
     "end": 36.13,
     "text": "组装，是取料再放到工位；补货，是从存储位取货放到拣货位；库位优化，是把零散库存合并；坏货处理，是把破损库存搬到坏货区。"
    },
    "comp-3": {
     "start": 36.58,
     "end": 56.38,
     "text": "它把扫描 LPN、拆分、托管、幂等和库存流水这些通用逻辑封装起来。Agent 只需要声明搬什么、搬到哪，不用重写库存逻辑。今后发现新的常用模块，也会用同样的方式加入步骤库，构建应用更稳定，也更高效。"
    }
   }
  },
  "s09-release": {
   "duration": 34.81,
   "segments": {
    "rel-1": {
     "start": 0.4,
     "end": 12.52,
     "text": "通常的流程是：用户在测试环境和 Agent 一起生成、修改、试运行验证，然后导出成定制包，导入生产环境，再走审批和发布。"
    },
    "rel-2": {
     "start": 12.97,
     "end": 33.81,
     "text": "发布由有权限的人确认，发布预览会列出哪些进行中的任务将跟随新版本：它们保留已保存的结果，从最新版本继续。每个版本都会保留，可以停用，也能从旧版本重新发布。生成成功不等于上线，发布始终是人的决定。"
    }
   }
  },
  "s10-case": {
   "duration": 13.56,
   "segments": {
    "case-1": {
     "start": 0.4,
     "end": 12.56,
     "text": "下面用一个案例把这些串起来：库存巡检发现破损，现场上报；主管在 Web 上集中处理，派出 Move Damage 任务，把破损库存搬到坏货区。"
    }
   }
  },
  "s11-patrol-plan": {
   "duration": 29.74,
   "segments": {
    "pp-1": {
     "start": 0.4,
     "end": 7.08,
     "text": "巡检员 John 在手持机上告诉 Agent：我要做库存巡检，看到破损就拍照上报。"
    },
    "pp-2": {
     "start": 9.58,
     "end": 20.82,
     "text": "Agent 查阅本体里的 Inventory Issue 和上报接口，提出计划：扫库位、扫 LPN，自动带出客户和物料，拍照、填数量，然后上报。"
    },
    "pp-3": {
     "start": 22.32,
     "end": 27.24,
     "text": "计划商定后，任务立即创建，直接打开沉浸式任务页。"
    }
   }
  },
  "s12-patrol-run": {
   "duration": 39.12,
   "segments": {
    "pr-1": {
     "start": 0.4,
     "end": 7.12,
     "text": "John 扫描库位 A12-05-1，再扫 LPN，客户和物料自动带出。"
    },
    "pr-2": {
     "start": 9.12,
     "end": 13,
     "text": "没拍照就提交，页面会拦住，提示补齐。"
    },
    "pr-3": {
     "start": 14.5,
     "end": 26.5,
     "text": "拍照、确认数量十二个，上报。系统创建 Inventory Issue，并当场把这批库存的货况从 Good 调整为 Damaged，它立刻不能再被拣货。"
    },
    "pr-4": {
     "start": 29,
     "end": 36.12,
     "text": "页面清空，John 继续巡检。这个任务好用，就保存为 Inventory Patrol 任务类型，明天直接用。"
    }
   }
  },
  "s13-page-build": {
   "duration": 24.58,
   "segments": {
    "pb-1": {
     "start": 0.4,
     "end": 12.28,
     "text": "Web 端，主管 Quinn 请 Agent 做一个破损库存转移工作台。Agent 写好 view 函数，在沙箱里用真实数据预览，再起草 Dynamic Page。"
    },
    "pb-2": {
     "start": 14.28,
     "end": 22.08,
     "text": "草稿只有作者看得到。发布时，系统根据页面会调用的每个接口，算出打开它需要的权限。"
    }
   }
  },
  "s14-page-use": {
   "duration": 28.94,
   "segments": {
    "pu-1": {
     "start": 0.4,
     "end": 12.08,
     "text": "发布后，页面出现在 Custom Apps 里。Quinn 看到巡检上报的破损记录，勾选两条，选择执行人 Maria Garcia，创建 Move Damage 任务。"
    },
    "pu-2": {
     "start": 15.08,
     "end": 26.44,
     "text": "页面以 Quinn 自己的身份调用接口。任务创建成功，两条 Issue 同时变为 In Progress，写入记录里标注着来自这个页面的哪个版本。"
    }
   }
  },
  "s15-type-build": {
   "duration": 28.76,
   "segments": {
    "tb-1": {
     "start": 0.4,
     "end": 13.8,
     "text": "Move Damage 这个任务类型，本身也是 Agent 构建的。它只用了一个 composable step，Move Inventory：搬运行由页面传入，货况是 Damaged，不写死目的库位。"
    },
    "tb-2": {
     "start": 15.3,
     "end": 26.26,
     "text": "目的地交给上架策略：Damaged 货况映射到 DMG 坏货区。Agent 起草类型，Quinn 试运行一遍，确认后发布第一版。"
    }
   }
  },
  "s16-move-run": {
   "duration": 37.68,
   "segments": {
    "mr-1": {
     "start": 0.4,
     "end": 6.04,
     "text": "Maria 在 My Tasks 里收到 Move Damage 任务，打开 Move Inventory 步骤。"
    },
    "mr-2": {
     "start": 7.54,
     "end": 21.42,
     "text": "扫错了库位，系统直接拒绝，并提示正确的位置。到 A12-05-1 扫库位，再扫物料，确认数量，装进新的 To LPN，库存进入任务托管。"
    },
    "mr-3": {
     "start": 23.42,
     "end": 34.18,
     "text": "到放货时，系统给出建议库位 DMG-01。扫描放下，搬运行关闭，任务关闭，两条 Issue 自动变为 Resolved。"
    }
   }
  },
  "s17-evidence": {
   "duration": 36.07,
   "segments": {
    "ev-1": {
     "start": 0.4,
     "end": 16.24,
     "text": "闭环的终点不是表单提交，而是有证据的业务状态变化：Issue 从 Open 到 In Progress 再到 Resolved，货况调整、取货和放货流水、页面版本和操作人，全部可追溯。"
    },
    "ev-2": {
     "start": 16.69,
     "end": 29.57,
     "text": "Agent 负责理解与生成，权限、校验、发布和回退，始终由 WMS 和人把关。需求不再排队等开发：现场说出来，当场就能用。"
    }
   }
  }
 },
 "total": 697.4
};
