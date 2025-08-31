import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { CreateNodeRequest, UpdateNodeRequest } from "../../entities/node";
import { useCreateNode, useNode, useUpdateNode } from "../../entities/node";
import { Layout } from "../../widgets/layout";

interface NodeFormData {
  title: string;
  content: string;
  tags: string;
  aliases: string;
  refs: string;
  file_type: "md" | "org";
}

function parseTagsString(str: string): string[] {
  return str
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

// Remove metadata from content to prevent duplication
function stripMetadataFromContent(content: string): string {
  const lines = content.split("\n");
  const cleanedLines: string[] = [];
  let inPropertiesBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip PROPERTIES blocks
    if (trimmed === ":PROPERTIES:") {
      inPropertiesBlock = true;
      continue;
    } else if (trimmed === ":END:" && inPropertiesBlock) {
      inPropertiesBlock = false;
      continue;
    } else if (inPropertiesBlock) {
      continue; // Skip all properties
    }

    // Skip org metadata lines
    if (trimmed.startsWith("#+")) {
      continue;
    }

    cleanedLines.push(line);
  }

  return cleanedLines.join("\n").trim();
}

export function NodeCreatePage() {
  const navigate = useNavigate();
  const createNodeMutation = useCreateNode();
  const titleId = useId();
  const fileTypeId = useId();
  const contentId = useId();
  const tagsId = useId();
  const aliasesId = useId();
  const refsId = useId();

  const [formData, setFormData] = useState<NodeFormData>({
    title: "",
    content: "",
    tags: "",
    aliases: "",
    refs: "",
    file_type: "org",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nodeRequest: CreateNodeRequest = {
      title: formData.title,
      content: formData.content,
      tags: parseTagsString(formData.tags),
      aliases: parseTagsString(formData.aliases),
      refs: parseTagsString(formData.refs),
      file_type: formData.file_type,
    };

    createNodeMutation.mutate(nodeRequest, {
      onSuccess: (newNode) => {
        navigate(`/nodes/${encodeURIComponent(newNode.id)}`);
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Layout>
      <div className="flex items-center space-x-4 mb-8">
        <Link to="/nodes" className="text-gray-600 hover:text-gray-800">
          ← Back to Nodes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Node</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor={titleId} className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id={titleId}
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter node title"
            />
          </div>

          <div>
            <label htmlFor={fileTypeId} className="block text-sm font-medium text-gray-700 mb-2">
              File Format
            </label>
            <select
              id={fileTypeId}
              name="file_type"
              value={formData.file_type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, file_type: e.target.value as "md" | "org" }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="md">Markdown (.md)</option>
              <option value="org">Org Mode (.org)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Choose the file format for your node</p>
          </div>

          <div>
            <label htmlFor={contentId} className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id={contentId}
              name="content"
              rows={10}
              value={formData.content}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter node content"
            />
          </div>

          <div>
            <label htmlFor={tagsId} className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              id={tagsId}
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter tags separated by commas"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple tags with commas (e.g., "tag1, tag2, tag3")
            </p>
          </div>

          <div>
            <label htmlFor={aliasesId} className="block text-sm font-medium text-gray-700 mb-2">
              Aliases
            </label>
            <input
              type="text"
              id={aliasesId}
              name="aliases"
              value={formData.aliases}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter aliases separated by commas"
            />
          </div>

          <div>
            <label htmlFor={refsId} className="block text-sm font-medium text-gray-700 mb-2">
              References
            </label>
            <input
              type="text"
              id={refsId}
              name="refs"
              value={formData.refs}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter references separated by commas"
            />
          </div>

          {createNodeMutation.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> Failed to create node.{" "}
              {createNodeMutation.error instanceof Error
                ? createNodeMutation.error.message
                : "Unknown error"}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={createNodeMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {createNodeMutation.isPending ? "Creating..." : "Create Node"}
            </button>
            <Link
              to="/nodes"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export function NodeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: node, isLoading, error } = useNode(id || "");
  const updateNodeMutation = useUpdateNode();
  const titleId = useId();
  const _fileTypeId = useId();
  const contentId = useId();
  const tagsId = useId();
  const aliasesId = useId();
  const refsId = useId();

  const [formData, setFormData] = useState<NodeFormData>({
    title: "",
    content: "",
    tags: "",
    aliases: "",
    refs: "",
    file_type: "org",
  });

  // Update form data when node is loaded
  React.useEffect(() => {
    if (node) {
      setFormData({
        title: node.title || "",
        content: stripMetadataFromContent(node.content || ""),
        tags: (node.tags || []).join(", "),
        aliases: (node.aliases || []).join(", "),
        refs: (node.refs || []).join(", "),
        file_type: "org", // Default for edit form
      });
    }
  }, [node]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    const nodeRequest: UpdateNodeRequest = {
      title: formData.title,
      content: formData.content,
      tags: parseTagsString(formData.tags),
      aliases: parseTagsString(formData.aliases),
      refs: parseTagsString(formData.refs),
    };

    updateNodeMutation.mutate(
      { id, data: nodeRequest },
      {
        onSuccess: () => {
          navigate(`/nodes/${encodeURIComponent(id)}`);
        },
      },
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading node...</p>
        </div>
      </Layout>
    );
  }

  if (error || !node) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> Node not found or server error.
          </div>
          <Link to="/nodes" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← Back to Nodes
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center space-x-4 mb-8">
        <Link to={`/nodes/${encodeURIComponent(id)}`} className="text-gray-600 hover:text-gray-800">
          ← Back to Node
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit: {node.title}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor={titleId} className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id={titleId}
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter node title"
            />
          </div>

          <div>
            <label htmlFor={contentId} className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id={contentId}
              name="content"
              rows={10}
              value={formData.content}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter node content"
            />
          </div>

          <div>
            <label htmlFor={tagsId} className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              id={tagsId}
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter tags separated by commas"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple tags with commas (e.g., "tag1, tag2, tag3")
            </p>
          </div>

          <div>
            <label htmlFor={aliasesId} className="block text-sm font-medium text-gray-700 mb-2">
              Aliases
            </label>
            <input
              type="text"
              id={aliasesId}
              name="aliases"
              value={formData.aliases}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter aliases separated by commas"
            />
          </div>

          <div>
            <label htmlFor={refsId} className="block text-sm font-medium text-gray-700 mb-2">
              References
            </label>
            <input
              type="text"
              id={refsId}
              name="refs"
              value={formData.refs}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter references separated by commas"
            />
          </div>

          {updateNodeMutation.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> Failed to update node.{" "}
              {updateNodeMutation.error instanceof Error
                ? updateNodeMutation.error.message
                : "Unknown error"}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={updateNodeMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors disabled:opacity-50"
            >
              {updateNodeMutation.isPending ? "Updating..." : "Update Node"}
            </button>
            <Link
              to={`/nodes/${encodeURIComponent(id)}`}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}
