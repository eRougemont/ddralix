<%@ page language="java" contentType="text/javascript; charset=UTF-8" pageEncoding="UTF-8" trimDirectiveWhitespaces="true"%>
<%@ include file="prelude.jsp" %>
<%@ page import="java.util.Iterator" %>
<%@ page import="alix.util.EdgeSquare" %>
<%@ page import="alix.util.Edge" %>


<%!

private double count(FormEnum results, int formId, OptionOrder order)
{
    switch (order) {
        case score:
            return results.score(formId);
        case hits:
            return results.hits(formId);
        case freq:
            return results.freq(formId);
        default:
            return results.occs(formId);
    }

}

%>
<%
final double radialWeight = 0.1; // lightnimg radial
// final int edgeMax = 4; // may become parameter
out.println("var data = {");
out.println("  right: " + pars.right +",");
out.println("  left: " + pars.left +",");
// global data handlers
String field = pars.field.name();
final FieldText ftext = alix.fieldText(field);
final FieldRail frail = alix.fieldRail(field);

// for each requested forms, get co-occurences stats
String[] forms = alix.tokenize(pars.q, pars.field.name());
if (forms == null || forms.length < 1) {
    out.println("    'error': 'Aucun mot demandé.'");
    out.println("}");
    return;
}
// Todo, get here corpus filter
Corpus corpus = null;
BitSet filter = null;
if (pars.book != null) {
    final int bookid = alix.getDocId(pars.book);
    if (bookid < 0)
        pars.book = null;
    else
        filter = Corpus.bits(alix, Alix.BOOKID, new String[] { pars.book });
}

int[] pivotIds = ftext.formIds(forms, filter);
if (pivotIds == null) {
    if (filter != null) {
        out.println("    'error': 'Mots introuvables pour le corpus");
    } 
    else {
        out.println("'error': 'Mots introuvables'");
    }
    out.println("}");
    return;
}
Arrays.sort(pivotIds); // sort pivots to make it esier to found later
int pivotCount = pivotIds.length;


//normalize forms
for (int i =0; i < pivotCount; i++) {
    forms[i] = ftext.form(pivotIds[i]);
}
boolean first;



// for each pivot word, we need a separate word list, with separate scoring
FormEnum[] stats = new FormEnum[pivotCount];
for (int i = 0; i < pivotCount; i++) {
    // build a freq list for coocs
    FormEnum results = new FormEnum(ftext);
    results.filter = filter; // corpus filter
    results.left = pars.left; // left context
    results.right = pars.right; // right context
    results.tags = pars.cat.tags(); // filter word list by tags
    // DO NOT record edges here
    long found = frail.coocs(pivotIds, results); // populate the wordlist
    // sort coocs by score 
    if (pars.order == OptionOrder.score) {
        // calculate score
        frail.score(pivotIds, results);
    }
    results.sort(pars.order.order());
    stats[i] = results;
}


// load nodes, and set their score
Map<Integer, Double> nodes = new HashMap<Integer, Double>();
double nodeMin = Double.MAX_VALUE;
double nodeMax = Double.MIN_VALUE;
int nodeCount = 0;
int mark = 0;
while (nodeCount < pars.nodes) {
    FormEnum results = stats[mark];
    // if no more form in this freqList, stop here
    if (!results.hasNext()) {
        break;
    }
    results.next();
    final int pivot = pivotIds[mark];
    int formId = results.formId();
    boolean isPivot = false;
    if (Arrays.binarySearch(pivotIds, formId) >= 0) {
    	isPivot = true;
    }
    // node already recorded update its score 
    if (nodes.containsKey(formId)) {
        Double score = nodes.get(formId);
        if (isPivot || score == Double.MIN_VALUE) { // is pivot
            continue;
        }
        // cooc shared
        score += results.score();
        if (score < nodeMin) {
            nodeMin = score;
        }
        if (score > nodeMax) {
            nodeMax = score;
        }
        nodes.put(formId, score);
        continue;
    }
    // new node
    nodeCount++;
    mark++; // pass to next results
    if (mark == pivotCount) {
        mark = 0;
    }
    // a pivot ?
    if (isPivot) {
        nodes.put(formId, Double.MIN_VALUE);
        continue;
    }
    // min-max size of nodes keps
    double count = count(results, results.formId(), pars.order);
    if (count < nodeMin) {
        nodeMin = count;
    }
    if (count > nodeMax) {
        nodeMax = count;
    }
    // not a pivot record score
    nodes.put(formId, count);
}

// show nodes
int[] nodeIds = new int[nodes.size()];
int nodeIndex = 0;
out.println("  nodes: [");
first = true;
for (Map.Entry<Integer, Double> entry : nodes.entrySet()) {
    // if (entry.getValue() < 1) continue;
    int formId = entry.getKey();
    nodeIds[nodeIndex] = formId;
    nodeIndex++;
    if (first) first = false;
    else out.println(", ");
    int tag = ftext.tag(formId);
    String color = "rgba(255, 255, 255, 1)";
    if (Tag.SUB.sameParent(tag)) color = "rgba(255, 255, 255, 0.8)";
    else if (Tag.ADJ.sameParent(tag)) color = "rgba(240, 255, 240, 0.7)";
    // if (node.type() == STAR) color = "rgba(255, 0, 0, 0.9)";
    else if (Tag.NAME.sameParent(tag)) color = "rgba(255, 192, 0, 1)";
    // else if (Tag.isVerb(tag)) color = "rgba(0, 0, 0, 1)";
    // else if (Tag.isAdj(tag)) color = "rgba(255, 128, 0, 1)";
    else color = "rgba(159, 183, 159, 1)";
    // {id:'n204', label:'coeur', x:-16, y:99, size:86, color:'hsla(0, 86%, 42%, 0.95)'},
    double size = entry.getValue();
    // pivot medium size
    if (size == Double.MIN_VALUE) {
        size = nodeMin + (nodeMax - nodeMin) / 2;
    }
    out.print("    {id:'n" + formId + "', label:'" + ftext.form(formId).replace("'", "\\'") + "', size:" + size); // node.count
    out.print(", x:" + ((int)(Math.random() * 100)) + ", y:" + ((int)(Math.random() * 100)) );
    out.print(", color:'" + color + "'");
    // is a pivot
    if (entry.getValue() < 1) out.print(", type:'hub'");
    out.print("}");
}
out.println("\n  ],");

// build edges
EdgeSquare edges = frail.edges(pivotIds, pars.left, pars.right, nodeIds, filter);
out.println("  edges: [");
first = true;
int edgeCount = 0;
for (Edge edge: edges) {
    if (edge.source == edge.target) {
        continue;
    }
    final double score = edge.score();
    if (first) first = false;
    else out.println(", ");
    out.print("    {id:'e" + (edgeCount) + "', source:'n" + edge.source + "', target:'n" + edge.target + "', size:" + (score<=0?0.1:score * 100) 
    + ", color:'rgba(192, 192, 192, 0.2)'"
    // for debug
    // + ", srcLabel:'" + ftext.form(srcId).replace("'", "\\'") + "', srcOccs:" + ftext.formOccs(srcId) + ", dstLabel:'" + ftext.form(dstId).replace("'", "\\'") + "', dstOccs:" + ftext.formOccs(dstId) + ", freq:" + freqList.freq()
    + "}");
    if (++edgeCount >= pars.edges) {
        break;
    }
}
out.println("\n  ],");
out.println("  time: '" + ( (System.nanoTime() - time) / 1000000) + "ms'");
out.println("};");

%>



