using System.Net;
using System.Linq;
using KDVManager.Services.Scheduling.Api.Requests.Compliance;
using KDVManager.Services.Scheduling.Api.Responses;
using KDVManager.Services.Scheduling.Application.Features.Compliance.Commands.RecordGroupStaffLevel;
using KDVManager.Services.Scheduling.Application.Features.Compliance.Commands.UploadComplianceDocument;
using KDVManager.Services.Scheduling.Application.Features.Compliance.Models;
using KDVManager.Services.Scheduling.Application.Features.Compliance.Queries.GetComplianceDocument;
using KDVManager.Services.Scheduling.Application.Features.Compliance.Queries.GetGroupComplianceSnapshot;
using KDVManager.Services.Scheduling.Application.Features.Compliance.Queries.ListComplianceDocuments;
using KDVManager.Services.Scheduling.Application.Features.Compliance.Queries.ListGroupComplianceSnapshots;
using Microsoft.AspNetCore.Mvc;

namespace KDVManager.Services.Scheduling.Api.Controllers;

[ApiController]
[Route("v1/[controller]")]
public class ComplianceController : ControllerBase
{
    private readonly GetGroupComplianceSnapshotQueryHandler _snapshotQueryHandler;
    private readonly ListGroupComplianceSnapshotsQueryHandler _snapshotHistoryQueryHandler;
    private readonly RecordGroupStaffLevelCommandHandler _staffLevelCommandHandler;
    private readonly UploadComplianceDocumentCommandHandler _uploadDocumentCommandHandler;
    private readonly ListComplianceDocumentsQueryHandler _listDocumentsQueryHandler;
    private readonly GetComplianceDocumentQueryHandler _getDocumentQueryHandler;

    public ComplianceController(
        GetGroupComplianceSnapshotQueryHandler snapshotQueryHandler,
        ListGroupComplianceSnapshotsQueryHandler snapshotHistoryQueryHandler,
        RecordGroupStaffLevelCommandHandler staffLevelCommandHandler,
        UploadComplianceDocumentCommandHandler uploadDocumentCommandHandler,
        ListComplianceDocumentsQueryHandler listDocumentsQueryHandler,
        GetComplianceDocumentQueryHandler getDocumentQueryHandler)
    {
        _snapshotQueryHandler = snapshotQueryHandler;
        _snapshotHistoryQueryHandler = snapshotHistoryQueryHandler;
        _staffLevelCommandHandler = staffLevelCommandHandler;
        _uploadDocumentCommandHandler = uploadDocumentCommandHandler;
        _listDocumentsQueryHandler = listDocumentsQueryHandler;
        _getDocumentQueryHandler = getDocumentQueryHandler;
    }

    [HttpGet("groups/{groupId:guid}/snapshot", Name = "GetGroupComplianceSnapshot")]
    [ProducesResponseType(typeof(ComplianceSnapshotResponse), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<ComplianceSnapshotResponse>> GetSnapshot(Guid groupId, [FromQuery] DateTime? atUtc, [FromQuery] bool refresh = true)
    {
        var dto = await _snapshotQueryHandler.Handle(new GetGroupComplianceSnapshotQuery
        {
            GroupId = groupId,
            AtUtc = atUtc,
            Refresh = refresh,
        });

        return Ok(Map(dto));
    }

    [HttpGet("groups/{groupId:guid}/history", Name = "ListGroupComplianceSnapshots")]
    [ProducesResponseType(typeof(IEnumerable<ComplianceSnapshotResponse>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<IEnumerable<ComplianceSnapshotResponse>>> GetHistory(Guid groupId, [FromQuery] DateTime fromUtc, [FromQuery] DateTime toUtc)
    {
        var dtos = await _snapshotHistoryQueryHandler.Handle(new ListGroupComplianceSnapshotsQuery
        {
            GroupId = groupId,
            FromUtc = fromUtc,
            ToUtc = toUtc,
        });

        return Ok(dtos.Select(Map));
    }

    [HttpPost("groups/{groupId:guid}/staffing", Name = "RecordGroupStaffing")]
    [ProducesResponseType(typeof(Guid), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(UnprocessableEntityResponse), (int)HttpStatusCode.UnprocessableEntity)]
    public async Task<ActionResult<Guid>> RecordStaffing(Guid groupId, [FromBody] RecordGroupStaffLevelCommand command)
    {
        command.GroupId = groupId;
        var id = await _staffLevelCommandHandler.Handle(command);
        return Ok(id);
    }

    [HttpPost("documents", Name = "UploadComplianceDocument")]
    [ProducesResponseType(typeof(Guid), (int)HttpStatusCode.OK)]
    [ProducesResponseType(typeof(UnprocessableEntityResponse), (int)HttpStatusCode.UnprocessableEntity)]
    public async Task<ActionResult<Guid>> UploadDocument([FromBody] UploadComplianceDocumentRequest request)
    {
        byte[] data;
        try
        {
            data = Convert.FromBase64String(request.DataBase64);
        }
        catch (FormatException ex)
        {
            ModelState.AddModelError(nameof(request.DataBase64), $"Invalid base64 payload: {ex.Message}");
            return ValidationProblem(ModelState);
        }

        var command = new UploadComplianceDocumentCommand
        {
            GroupId = request.GroupId,
            Title = request.Title,
            FileName = request.FileName,
            ContentType = request.ContentType,
            Data = data,
            ValidFromUtc = request.ValidFromUtc,
            ValidUntilUtc = request.ValidUntilUtc,
            UploadedBy = request.UploadedBy,
        };

        var id = await _uploadDocumentCommandHandler.Handle(command);
        return Ok(id);
    }

    [HttpGet("groups/{groupId:guid}/documents", Name = "ListComplianceDocuments")]
    [ProducesResponseType(typeof(IEnumerable<ComplianceDocumentListItemResponse>), (int)HttpStatusCode.OK)]
    public async Task<ActionResult<IEnumerable<ComplianceDocumentListItemResponse>>> ListDocuments(Guid groupId)
    {
        var dtos = await _listDocumentsQueryHandler.Handle(new ListComplianceDocumentsQuery
        {
            GroupId = groupId,
        });

        return Ok(dtos.Select(d => new ComplianceDocumentListItemResponse
        {
            Id = d.Id,
            GroupId = d.GroupId,
            Title = d.Title,
            FileName = d.FileName,
            ContentType = d.ContentType,
            UploadedAtUtc = d.UploadedAtUtc,
            UploadedBy = d.UploadedBy,
            ValidFromUtc = d.ValidFromUtc,
            ValidUntilUtc = d.ValidUntilUtc,
        }));
    }

    [HttpGet("documents/{documentId:guid}", Name = "DownloadComplianceDocument")]
    public async Task<ActionResult> DownloadDocument(Guid documentId)
    {
        var dto = await _getDocumentQueryHandler.Handle(new GetComplianceDocumentQuery
        {
            DocumentId = documentId,
        });

        return File(dto.Data, dto.ContentType, dto.FileName);
    }

    private static ComplianceSnapshotResponse Map(GroupComplianceSnapshotDto dto)
    {
        return new ComplianceSnapshotResponse
        {
            Id = dto.Id,
            GroupId = dto.GroupId,
            CapturedAtUtc = dto.CapturedAtUtc,
            PresentChildrenCount = dto.PresentChildrenCount,
            RequiredStaffCount = dto.RequiredStaffCount,
            QualifiedStaffCount = dto.QualifiedStaffCount,
            BufferPercent = dto.BufferPercent,
            Status = dto.Status,
            Notes = dto.Notes,
        };
    }
}
