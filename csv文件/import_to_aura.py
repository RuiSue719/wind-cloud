import csv
import os
from neo4j import GraphDatabase

# ========== 修改这里 ==========
AURA_URI = "neo4j+s://01a0e5bf.databases.neo4j.io"   # 你的 AuraDB URL
AURA_USER = "01a0e5bf"
AURA_PASSWORD = "JZ920NcZWJmZe3Cc3WjYNouz7hOvk1Qxr8XfPSPRjXU"
CSV_DIR = "./"  # CSV 文件所在的文件夹，当前目录就用 "."
# ==============================

driver = GraphDatabase.driver(AURA_URI, auth=(AURA_USER, AURA_PASSWORD))

def read_csv(filename):
    """读取 CSV 文件，返回行列表，每行是一个 dict"""
    path = os.path.join(CSV_DIR, filename)
    with open(path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)

def safe_props(row):
    """过滤掉空值、占位符，并处理列表值，同时过滤无效的键"""
    props = {}
    for k, v in row.items():
        # 跳过 id 和标签列
        if k in ("id:ID", ":LABEL", ":TYPE", ":START_ID", ":END_ID"):
            continue
        # 跳过键为 None 或空字符串
        if k is None or str(k).strip() == "":
            continue
        # 处理列表值（如果 CSV 中某字段因逗号被读成了列表）
        if isinstance(v, list):
            if v:
                v = v[0] if len(v) == 1 else ', '.join(str(x) for x in v)
            else:
                continue
        # 跳过空值、'-'
        if v is None or str(v).strip() == "" or str(v).strip() == "-":
            continue
        props[str(k).strip()] = str(v).strip()
    return props

def create_nodes(tx, label, node_id, props):
    # 使用 MERGE，根据 id 属性唯一确定节点
    query = (
        f"MERGE (n:`{label}` {{id: $node_id}}) "
        "SET n += $props"
    )
    tx.run(query, props=props, node_id=node_id)

def create_relationship(tx, start_id, end_id, rel_type, props):
    """利用节点的 id 属性创建关系"""
    query = (
        "MATCH (a {id: $start_id}) "
        "MATCH (b {id: $end_id}) "
        f"CREATE (a)-[r:`{rel_type}`]->(b) "
        "SET r = $props"
    )
    tx.run(query, start_id=start_id, end_id=end_id, props=props)

def import_nodes(session, filename, label_col=":LABEL", id_col="id:ID"):
    data = read_csv(filename)
    print(f"导入 {filename}，共 {len(data)} 条节点")
    for row in data:
        label = row[label_col] 
        if not label or label.strip() == "":
            print(f"警告：跳过空标签行: {row}")  
            continue      
        node_id = row[id_col]           # 原始 ID，如 ac_001
        props = safe_props(row)         # 其他属性
        session.execute_write(create_nodes, label, node_id, props)

def import_relations(session):
    data = read_csv("relations.csv")
    print(f"导入 relations.csv，共 {len(data)} 条关系")
    for row in data:
        start_id = row[":START_ID"]
        end_id = row[":END_ID"]
        rel_type = row[":TYPE"]
        props = safe_props(row)
        session.execute_write(create_relationship, start_id, end_id, rel_type, props)

# 主流程
with driver.session() as session:
    # 1. 导入节点（按顺序）
    node_files = [
        ("alarm_code.csv", "报警码"),
        ("equipment.csv", None),        # equipment.csv 里标签可能包含"风机整机"和"装备"，但 CSV 中 :LABEL 列已经是标签值
        ("fault_cause.csv", "故障原因"),
        ("fault_mode.csv", "故障模式"),
        ("fault_phenomenon.csv", "故障现象"),
        ("repair_step.csv", "维修步骤"),
        ("repair_tool.csv", "维修工具"),
    ]
    # 实际上不用写死标签，import_nodes 函数会从 CSV 的 :LABEL 列读取
    for filename, _ in node_files:
        import_nodes(session, filename)

    # 2. 导入关系
    import_relations(session)

driver.close()
print("全部导入完成！")